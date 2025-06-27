export type WidgetType = 
  | 'balance-overview'
  | 'recent-transactions'
  | 'expense-breakdown'
  | 'monthly-comparison'
  | 'upcoming-bills'
  | 'investment-summary'
  | 'budget-progress'
  | 'quick-actions';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings?: Record<string, any>;
  isVisible: boolean;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  gridCols: number;
  gridRows: number;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  investmentValue: number;
  debtAmount: number;
  netWorth: number;
}

export interface TransactionSummary {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BudgetProgress {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'exceeded';
}