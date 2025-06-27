import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Loan from '../models/loan.model';
import { AuthRequest } from '../types';
import { asyncHandler, createError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../utils/constants';
import { addMonths, differenceInMonths } from 'date-fns';

export const getLoans = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { type, status, sortBy = 'nextPaymentDate', order = 'asc' } = req.query;

  const query: any = { userId };

  if (type) {
    query.loanType = type;
  }

  if (status) {
    query.status = status;
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const loans = await Loan.find(query)
    .sort({ [sortBy as string]: sortOrder })
    .lean();

  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalBalance = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const totalMonthlyPayment = loans
    .filter(loan => loan.status === 'active')
    .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const totalPaidOff = totalPrincipal - totalBalance;

  res.json({
    success: true,
    data: {
      loans,
      summary: {
        totalPrincipal,
        totalBalance,
        totalPaidOff,
        totalMonthlyPayment,
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        paidOffLoans: loans.filter(loan => loan.status === 'paid_off').length,
      },
    },
  });
});

export const getLoanById = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const loan = await Loan.findOne({ _id: id, userId });

  if (!loan) {
    throw createError('Loan not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const monthsRemaining = differenceInMonths(new Date(loan.endDate), new Date());
  const totalInterest = (loan.monthlyPayment * differenceInMonths(new Date(loan.endDate), new Date(loan.startDate))) - loan.principalAmount;
  const paidAmount = loan.principalAmount - loan.currentBalance;
  const progressPercentage = loan.principalAmount > 0 ? (paidAmount / loan.principalAmount) * 100 : 0;

  res.json({
    success: true,
    data: {
      ...loan.toObject(),
      monthsRemaining,
      totalInterest,
      paidAmount,
      progressPercentage,
    },
  });
});

export const createLoan = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const loanData = {
    ...req.body,
    userId,
    currentBalance: req.body.currentBalance || req.body.principalAmount,
  };

  const loan = await Loan.create(loanData);

  res.status(201).json({
    success: true,
    data: loan,
  });
});

export const updateLoan = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const loan = await Loan.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!loan) {
    throw createError('Loan not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: loan,
  });
});

export const deleteLoan = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const loan = await Loan.findOneAndDelete({ _id: id, userId });

  if (!loan) {
    throw createError('Loan not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    message: 'Loan deleted successfully',
  });
});

export const recordPayment = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user!.userId;

  const loan = await Loan.findOne({ _id: id, userId });

  if (!loan) {
    throw createError('Loan not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (loan.status !== 'active') {
    throw createError('Cannot record payment for inactive loan', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  loan.currentBalance = Math.max(0, loan.currentBalance - amount);
  
  if (loan.currentBalance === 0) {
    loan.status = 'paid_off';
  } else {
    loan.nextPaymentDate = addMonths(new Date(loan.nextPaymentDate), 1);
  }

  await loan.save();

  res.json({
    success: true,
    data: loan,
    message: 'Payment recorded successfully',
  });
});

export const getLoanStats = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const stats = await Loan.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: '$loanType',
        count: { $sum: 1 },
        totalPrincipal: { $sum: '$principalAmount' },
        currentBalance: { $sum: '$currentBalance' },
        monthlyPayment: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, '$monthlyPayment', 0]
          }
        },
        averageInterestRate: { $avg: '$interestRate' },
      },
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalPrincipal: 1,
        currentBalance: 1,
        monthlyPayment: 1,
        averageInterestRate: 1,
        paidAmount: { $subtract: ['$totalPrincipal', '$currentBalance'] },
      },
    },
    {
      $sort: { currentBalance: -1 },
    },
  ]);

  const overallStats = await Loan.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: null,
        totalLoans: { $sum: 1 },
        activeLoans: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        paidOffLoans: {
          $sum: { $cond: [{ $eq: ['$status', 'paid_off'] }, 1, 0] }
        },
        totalPrincipal: { $sum: '$principalAmount' },
        currentBalance: { $sum: '$currentBalance' },
        totalMonthlyPayment: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, '$monthlyPayment', 0]
          }
        },
        averageInterestRate: { $avg: '$interestRate' },
      },
    },
    {
      $project: {
        _id: 0,
        totalLoans: 1,
        activeLoans: 1,
        paidOffLoans: 1,
        totalPrincipal: 1,
        currentBalance: 1,
        totalPaidOff: { $subtract: ['$totalPrincipal', '$currentBalance'] },
        totalMonthlyPayment: 1,
        averageInterestRate: 1,
        payoffProgress: {
          $cond: [
            { $eq: ['$totalPrincipal', 0] },
            0,
            {
              $multiply: [
                { $divide: [
                  { $subtract: ['$totalPrincipal', '$currentBalance'] },
                  '$totalPrincipal'
                ] },
                100
              ]
            }
          ]
        },
      },
    },
  ]);

  const upcomingPayments = await Loan.find({
    userId,
    status: 'active',
    nextPaymentDate: {
      $gte: new Date(),
      $lte: addMonths(new Date(), 1),
    },
  })
    .select('loanName monthlyPayment nextPaymentDate')
    .sort('nextPaymentDate')
    .limit(5)
    .lean();

  res.json({
    success: true,
    data: {
      byType: stats,
      overall: overallStats[0] || {
        totalLoans: 0,
        activeLoans: 0,
        paidOffLoans: 0,
        totalPrincipal: 0,
        currentBalance: 0,
        totalPaidOff: 0,
        totalMonthlyPayment: 0,
        averageInterestRate: 0,
        payoffProgress: 0,
      },
      upcomingPayments,
    },
  });
});