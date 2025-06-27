import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/transaction.model';
import Account from '../models/account.model';
import Investment from '../models/investment.model';
import Loan from '../models/loan.model';
import Reminder from '../models/reminder.model';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/error.middleware';

// Get dashboard overview data
export const getDashboardData = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Get accounts summary
  const accounts = await Account.find({ userId, isActive: true });
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Get monthly income and expenses
  const monthlyStats = await Transaction.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const monthlyIncome = monthlyStats.find(s => s._id === 'income')?.total || 0;
  const monthlyExpenses = monthlyStats.find(s => s._id === 'expense')?.total || 0;

  // Get investments summary
  const investments = await Investment.find({ userId });
  const totalInvestment = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);

  // Get loans summary
  const loans = await Loan.find({ userId, status: 'active' });
  const totalDebt = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);

  // Calculate net worth
  const netWorth = totalBalance + totalInvestment - totalDebt;

  // Calculate savings rate
  const savingsRate = monthlyIncome > 0 
    ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
    : 0;

  res.json({
    data: {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      netWorth,
      debtAmount: totalDebt,
      investmentValue: totalInvestment,
      accountsCount: accounts.length
    }
  });
});

// Get recent transactions for dashboard
export const getRecentTransactions = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 10;

  const transactions = await Transaction.find({ userId })
    .populate('accountId', 'name type color')
    .sort({ date: -1 })
    .limit(limit);

  res.json({ data: transactions });
});

// Get expense breakdown for dashboard
export const getExpenseBreakdown = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const breakdown = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth }
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
      $limit: 8
    }
  ]);

  // Calculate total for percentages
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  // Add colors for each category
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#6b7280'
  ];

  const data = breakdown.map((item, index) => ({
    category: item._id,
    amount: item.amount,
    percentage: total > 0 ? (item.amount / total) * 100 : 0,
    color: colors[index % colors.length]
  }));

  res.json({ data });
});

// Get budget progress for dashboard
export const getBudgetProgress = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // For now, we'll use predefined budget limits
  // In a real app, these would come from a Budget model
  const budgetLimits: Record<string, number> = {
    'Housing': 2000,
    'Food & Dining': 1000,
    'Transportation': 600,
    'Shopping': 500,
    'Entertainment': 400,
  };

  const spending = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
        category: { $in: Object.keys(budgetLimits) }
      }
    },
    {
      $group: {
        _id: '$category',
        spent: { $sum: '$amount' }
      }
    }
  ]);

  const budgetData = Object.keys(budgetLimits).map(category => {
    const spentItem = spending.find(s => s._id === category);
    const spent = spentItem?.spent || 0;
    const budget = budgetLimits[category];
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;
    
    let status: 'on-track' | 'warning' | 'exceeded';
    if (percentage > 100) status = 'exceeded';
    else if (percentage > 80) status = 'warning';
    else status = 'on-track';

    return {
      category,
      spent,
      budget,
      percentage: Math.min(percentage, 100),
      remaining,
      status
    };
  });

  res.json({ data: budgetData });
});

// Get upcoming bills for dashboard
export const getUpcomingBills = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.userId;
  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(now.getDate() + 30);

  // Get upcoming reminders that are bill-related
  const bills = await Reminder.find({
    userId,
    isActive: true,
    dueDate: { $gte: now, $lte: thirtyDaysLater },
    category: { $in: ['Bills & Utilities', 'Rent', 'Loan Payment', 'Insurance'] }
  })
    .sort({ dueDate: 1 })
    .limit(10);

  // Transform reminders to bill format
  const upcomingBills = bills.map(reminder => ({
    id: reminder._id,
    name: reminder.title,
    amount: reminder.amount || 0,
    dueDate: reminder.dueDate,
    category: reminder.category || 'Bills & Utilities',
    isPaid: false,
    isRecurring: reminder.frequency !== 'once',
    frequency: reminder.frequency
  }));

  res.json({ data: upcomingBills });
});