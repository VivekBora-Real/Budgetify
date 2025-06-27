import {  Response, NextFunction } from 'express';
import Account from '../models/account.model';
import Transaction from '../models/transaction.model';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { createError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../utils/constants';

// Get all accounts
export const getAccounts = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { isActive } = req.query;

  const query: any = { userId };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const accounts = await Account.find(query).sort({ createdAt: -1 });

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => 
    sum + (account.isActive ? account.balance : 0), 0
  );

  res.json({
    data: accounts,
    summary: {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.isActive).length,
      totalBalance
    }
  });
});

// Get single account
export const getAccount = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const account = await Account.findOne({ _id: id, userId });

  if (!account) {
    throw createError('Account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Get recent transactions for this account
  const recentTransactions = await Transaction.find({ 
    accountId: id,
    userId 
  })
    .sort({ date: -1 })
    .limit(10);

  res.json({ 
    data: {
      ...account.toObject(),
      recentTransactions
    }
  });
});

// Create account
export const createAccount = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const accountData = { ...req.body, userId };

  const account = await Account.create(accountData);

  res.status(201).json({
    data: account,
    message: 'Account created successfully'
  });
});

// Update account
export const updateAccount = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Don't allow updating balance directly
  delete req.body.balance;
  delete req.body.userId;

  const account = await Account.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!account) {
    throw createError('Account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    data: account,
    message: 'Account updated successfully'
  });
});

// Delete account
export const deleteAccount = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if account has transactions
  const transactionCount = await Transaction.countDocuments({ 
    accountId: id,
    userId 
  });

  if (transactionCount > 0) {
    throw createError(
      'Cannot delete account with existing transactions. Please delete all transactions first.',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const account = await Account.findOneAndDelete({ _id: id, userId });

  if (!account) {
    throw createError('Account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({
    message: 'Account deleted successfully'
  });
});

// Get account statistics
export const getAccountStats = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;

  // Get all accounts
  const accounts = await Account.find({ userId, isActive: true });

  // Calculate statistics by account type
  const statsByType = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = {
        count: 0,
        totalBalance: 0,
        accounts: []
      };
    }
    
    acc[account.type].count++;
    acc[account.type].totalBalance += account.balance;
    acc[account.type].accounts.push({
      id: account._id,
      name: account.name,
      balance: account.balance,
      color: account.color
    });
    
    return acc;
  }, {} as any);

  // Get monthly cash flow for each account
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const cashFlow = await Transaction.aggregate([
    {
      $match: {
        userId,
        date: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          accountId: '$accountId',
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    }
  ]);

  res.json({
    data: {
      statsByType,
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      accountCount: accounts.length,
      cashFlow
    }
  });
});