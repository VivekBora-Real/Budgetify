import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Investment from '../models/investment.model';
import { AuthRequest } from '../types';
import { asyncHandler, createError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../utils/constants';

export const getInvestments = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { type, broker, sortBy = 'purchaseDate', order = 'desc' } = req.query;

  const query: any = { userId };

  if (type) {
    query.type = type;
  }

  if (broker) {
    query.broker = broker;
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const investments = await Investment.find(query)
    .sort({ [sortBy as string]: sortOrder })
    .lean();

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
  const currentValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100) : 0;

  res.json({
    success: true,
    data: {
      investments,
      summary: {
        totalInvested,
        currentValue,
        totalGainLoss,
        totalGainLossPercentage,
        count: investments.length,
      },
    },
  });
});

export const getInvestmentById = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const investment = await Investment.findOne({ _id: id, userId });

  if (!investment) {
    throw createError('Investment not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const totalValue = investment.currentPrice * investment.quantity;
  const investedAmount = investment.purchasePrice * investment.quantity;
  const gainLoss = totalValue - investedAmount;
  const gainLossPercentage = investedAmount > 0 ? ((gainLoss / investedAmount) * 100) : 0;

  res.json({
    success: true,
    data: {
      ...investment.toObject(),
      totalValue,
      investedAmount,
      gainLoss,
      gainLossPercentage,
    },
  });
});

export const createInvestment = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const investmentData = {
    ...req.body,
    userId,
  };

  const investment = await Investment.create(investmentData);

  res.status(201).json({
    success: true,
    data: investment,
  });
});

export const updateInvestment = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const investment = await Investment.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!investment) {
    throw createError('Investment not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    data: investment,
  });
});

export const deleteInvestment = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const investment = await Investment.findOneAndDelete({ _id: id, userId });

  if (!investment) {
    throw createError('Investment not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    success: true,
    message: 'Investment deleted successfully',
  });
});

export const getInvestmentStats = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const stats = await Investment.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalInvested: { 
          $sum: { $multiply: ['$purchasePrice', '$quantity'] } 
        },
        currentValue: { 
          $sum: { $multiply: ['$currentPrice', '$quantity'] } 
        },
      },
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalInvested: 1,
        currentValue: 1,
        gainLoss: { $subtract: ['$currentValue', '$totalInvested'] },
        gainLossPercentage: {
          $cond: [
            { $eq: ['$totalInvested', 0] },
            0,
            { 
              $multiply: [
                { $divide: [
                  { $subtract: ['$currentValue', '$totalInvested'] },
                  '$totalInvested'
                ] },
                100
              ]
            }
          ]
        },
      },
    },
    {
      $sort: { currentValue: -1 },
    },
  ]);

  const overallStats = await Investment.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: null,
        totalInvested: { 
          $sum: { $multiply: ['$purchasePrice', '$quantity'] } 
        },
        currentValue: { 
          $sum: { $multiply: ['$currentPrice', '$quantity'] } 
        },
        uniqueBrokers: { $addToSet: '$broker' },
        totalInvestments: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalInvested: 1,
        currentValue: 1,
        gainLoss: { $subtract: ['$currentValue', '$totalInvested'] },
        gainLossPercentage: {
          $cond: [
            { $eq: ['$totalInvested', 0] },
            0,
            { 
              $multiply: [
                { $divide: [
                  { $subtract: ['$currentValue', '$totalInvested'] },
                  '$totalInvested'
                ] },
                100
              ]
            }
          ]
        },
        brokersCount: { $size: '$uniqueBrokers' },
        totalInvestments: 1,
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      byType: stats,
      overall: overallStats[0] || {
        totalInvested: 0,
        currentValue: 0,
        gainLoss: 0,
        gainLossPercentage: 0,
        brokersCount: 0,
        totalInvestments: 0,
      },
    },
  });
});