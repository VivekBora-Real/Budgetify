// Auth Types
export interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    currency: string;
    timezone: string;
  };
  preferences: {
    dashboardLayout?: any;
    notifications: {
      email: boolean;
      inApp: boolean;
      reminders: boolean;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Account Types
export interface Account {
  id: string;
  name: string;
  type: 'savings' | 'current' | 'credit_card' | 'cash' | 'digital_wallet';
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  tags: string[];
  description: string;
  date: string;
  attachments: string[];
  isRecurring: boolean;
  recurringDetails?: {
    frequency: string;
    endDate?: string;
    parentTransactionId?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  isActive: boolean;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings?: any;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  monthlyChange: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// Reminder Types
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  dueDate: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category?: string;
  isActive: boolean;
  lastNotified?: string;
  completedDates: string[];
}

// Warranty Types
export interface Warranty {
  id: string;
  productName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  expiryDate: string;
  price: number;
  seller: string;
  documents: string[];
  notes?: string;
  status: 'active' | 'expired' | 'expiring_soon';
  category?: string;
  remindBeforeDays: number;
}

// Investment Types
export interface Investment {
  id: string;
  name: string;
  type: 'fixed_deposit' | 'recurring_deposit' | 'mutual_fund' | 'stocks' | 'bonds' | 'real_estate' | 'gold' | 'cryptocurrency';
  investedAmount: number;
  currentValue: number;
  startDate: string;
  maturityDate?: string;
  interestRate?: number;
  returns: number;
  returnPercentage: number;
  institution: string;
  accountNumber?: string;
  notes?: string;
  isActive: boolean;
  documents: string[];
}

// Loan Types
export interface Loan {
  id: string;
  loanType: 'home_loan' | 'personal_loan' | 'vehicle_loan' | 'education_loan' | 'credit_card_debt';
  lender: string;
  principal: number;
  interestRate: number;
  tenure: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  outstandingAmount: number;
  totalPayable: number;
  totalInterest: number;
  paidEMIs: number;
  nextEMIDate?: string;
  prepayments: Array<{
    date: string;
    amount: number;
    note?: string;
  }>;
  documents: string[];
  notes?: string;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}