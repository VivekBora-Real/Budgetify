import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/transaction.model';
import Account from '../models/account.model';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { createError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../utils/constants';

// Get all transactions with filtering and pagination
export const getTransactions = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const {
    page = 1,
    limit = 20,
    accountId,
    category,
    type,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query: any = { userId };

  if (accountId) query.accountId = accountId;
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  // Date filtering
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate as string);
    if (endDate) query.date.$lte = new Date(endDate as string);
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('accountId', 'name type color')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments(query)
  ]);

  res.json({
    data: transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Get single transaction
export const getTransaction = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const transaction = await Transaction.findOne({ _id: id, userId })
    .populate('accountId', 'name type color');

  if (!transaction) {
    throw createError('Transaction not found', 404, ERROR_CODES.NOT_FOUND);
  }

  res.json({ data: transaction });
});

// Create transaction
export const createTransaction = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const transactionData = { ...req.body, userId };

  // Verify account belongs to user
  const account = await Account.findOne({ 
    _id: transactionData.accountId, 
    userId 
  });

  if (!account) {
    throw createError('Account not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Create transaction
  const transaction = await Transaction.create(transactionData);

  // Update account balance
  if (transaction.type === 'income') {
    account.balance += transaction.amount;
  } else {
    account.balance -= transaction.amount;
  }
  await account.save();

  // Populate account details
  await transaction.populate('accountId', 'name type color');

  res.status(201).json({
    data: transaction,
    message: 'Transaction created successfully'
  });
});

// Update transaction
export const updateTransaction = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Find existing transaction
  const existingTransaction = await Transaction.findOne({ _id: id, userId });
  if (!existingTransaction) {
    throw createError('Transaction not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // If account is changed, verify new account
  if (req.body.accountId && req.body.accountId !== existingTransaction.accountId.toString()) {
    const newAccount = await Account.findOne({ 
      _id: req.body.accountId, 
      userId 
    });
    if (!newAccount) {
      throw createError('Account not found', 404, ERROR_CODES.NOT_FOUND);
    }
  }

  // Store old values for balance adjustment
  const oldAmount = existingTransaction.amount;
  const oldType = existingTransaction.type;
  const oldAccountId = existingTransaction.accountId;

  // Update transaction
  const transaction = await Transaction.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).populate('accountId', 'name type color');

  // Adjust account balances if needed
  if (oldAmount !== transaction!.amount || 
      oldType !== transaction!.type || 
      oldAccountId.toString() !== transaction!.accountId.toString()) {
    
    // Revert old transaction effect
    const oldAccount = await Account.findById(oldAccountId);
    if (oldAccount) {
      if (oldType === 'income') {
        oldAccount.balance -= oldAmount;
      } else {
        oldAccount.balance += oldAmount;
      }
      await oldAccount.save();
    }

    // Apply new transaction effect
    const newAccount = await Account.findById(transaction!.accountId);
    if (newAccount) {
      if (transaction!.type === 'income') {
        newAccount.balance += transaction!.amount;
      } else {
        newAccount.balance -= transaction!.amount;
      }
      await newAccount.save();
    }
  }

  res.json({
    data: transaction,
    message: 'Transaction updated successfully'
  });
});

// Delete transaction
export const deleteTransaction = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Find transaction
  const transaction = await Transaction.findOne({ _id: id, userId });
  if (!transaction) {
    throw createError('Transaction not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Adjust account balance
  const account = await Account.findById(transaction.accountId);
  if (account) {
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
    } else {
      account.balance += transaction.amount;
    }
    await account.save();
  }

  // Delete transaction
  await transaction.deleteOne();

  res.json({
    message: 'Transaction deleted successfully'
  });
});

// Get transaction statistics
export const getTransactionStats = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const { period = 'month' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  // Aggregate statistics
  const stats = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $count: {} }
      }
    }
  ]);

  // Category breakdown
  const categoryBreakdown = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        count: { $count: {} }
      }
    },
    {
      $sort: { amount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Format response
  const income = stats.find(s => s._id === 'income') || { total: 0, count: 0 };
  const expense = stats.find(s => s._id === 'expense') || { total: 0, count: 0 };

  res.json({
    data: {
      totalIncome: income.total,
      totalExpense: expense.total,
      netAmount: income.total - expense.total,
      transactionCount: income.count + expense.count,
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat._id,
        amount: cat.amount,
        count: cat.count,
        percentage: expense.total > 0 ? (cat.amount / expense.total) * 100 : 0
      }))
    }
  });
});

// Export transactions as CSV
export const exportTransactions = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const {
    accountId,
    category,
    type,
    startDate,
    endDate,
    search
  } = req.query;

  // Build query (same as getTransactions)
  const query: any = { userId };

  if (accountId) query.accountId = accountId;
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  // Date filtering
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate as string);
    if (endDate) query.date.$lte = new Date(endDate as string);
  }

  // Get all transactions (no pagination for export)
  const transactions = await Transaction.find(query)
    .populate('accountId', 'name type')
    .sort({ date: -1 });

  // Create CSV headers
  const csvHeaders = [
    'Date',
    'Type',
    'Amount',
    'Category',
    'Description',
    'Account',
    'Account Type',
    'Tags'
  ].join(',');

  // Convert transactions to CSV rows
  const csvRows = transactions.map(transaction => {
    const account = transaction.accountId as any;
    const row = [
      transaction.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      transaction.type,
      transaction.amount.toFixed(2),
      transaction.category,
      `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in description
      account.name,
      account.type,
      transaction.tags.join('; ') // Join tags with semicolon
    ];
    return row.join(',');
  });

  // Combine headers and rows
  const csvContent = [csvHeaders, ...csvRows].join('\n');

  // Set response headers for CSV download
  const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Send CSV content
  res.send(csvContent);
});