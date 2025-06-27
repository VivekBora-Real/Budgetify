import api from './api';

export interface DashboardOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  netWorth: number;
  debtAmount: number;
  investmentValue: number;
  accountsCount: number;
}

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface BudgetProgressItem {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  status: 'on-track' | 'warning' | 'exceeded';
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: string;
}

class DashboardService {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/dashboard/overview');
    return response.data.data;
  }

  async getRecentTransactions(limit: number = 10) {
    const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data.data;
  }

  async getExpenseBreakdown(): Promise<ExpenseBreakdownItem[]> {
    const response = await api.get('/dashboard/expense-breakdown');
    return response.data.data;
  }

  async getBudgetProgress(): Promise<BudgetProgressItem[]> {
    const response = await api.get('/dashboard/budget-progress');
    return response.data.data;
  }

  async getUpcomingBills(): Promise<UpcomingBill[]> {
    const response = await api.get('/dashboard/upcoming-bills');
    return response.data.data;
  }
}

export default new DashboardService();