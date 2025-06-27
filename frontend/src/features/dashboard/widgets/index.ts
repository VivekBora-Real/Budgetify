import React from 'react';
import BalanceOverviewWidget from './BalanceOverviewWidget';
import RecentTransactionsWidget from './RecentTransactionsWidget';
import ExpenseBreakdownWidget from './ExpenseBreakdownWidget';
import BudgetProgressWidget from './BudgetProgressWidget';
import UpcomingBillsWidget from './UpcomingBillsWidget';
import type { WidgetType } from '../types';

export const widgetComponents: Record<WidgetType, React.ComponentType<any>> = {
  'balance-overview': BalanceOverviewWidget,
  'recent-transactions': RecentTransactionsWidget,
  'expense-breakdown': ExpenseBreakdownWidget,
  'budget-progress': BudgetProgressWidget,
  'upcoming-bills': UpcomingBillsWidget,
  'monthly-comparison': BalanceOverviewWidget, // Placeholder for now
  'investment-summary': BalanceOverviewWidget, // Placeholder for now
  'quick-actions': BalanceOverviewWidget, // Placeholder for now
};

export const widgetDefinitions = [
  {
    type: 'balance-overview' as WidgetType,
    title: 'Balance Overview',
    description: 'View your financial summary at a glance',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  {
    type: 'recent-transactions' as WidgetType,
    title: 'Recent Transactions',
    description: 'Track your latest income and expenses',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  {
    type: 'expense-breakdown' as WidgetType,
    title: 'Expense Breakdown',
    description: 'Analyze spending by category',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
  },
  {
    type: 'budget-progress' as WidgetType,
    title: 'Budget Progress',
    description: 'Monitor budget usage and limits',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
  },
  {
    type: 'upcoming-bills' as WidgetType,
    title: 'Upcoming Bills',
    description: 'Stay on top of upcoming payments',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
  },
];