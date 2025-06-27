export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;

export const ACCOUNT_TYPES = {
  SAVINGS: 'savings',
  CURRENT: 'current',
  CREDIT_CARD: 'credit_card',
  CASH: 'cash',
  DIGITAL_WALLET: 'digital_wallet'
} as const;

export const REMINDER_FREQUENCY = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
} as const;

export const WARRANTY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring_soon'
} as const;

export const INVESTMENT_TYPES = {
  FD: 'fixed_deposit',
  RD: 'recurring_deposit',
  MUTUAL_FUND: 'mutual_fund',
  STOCKS: 'stocks',
  BONDS: 'bonds',
  REAL_ESTATE: 'real_estate',
  GOLD: 'gold',
  CRYPTO: 'cryptocurrency'
} as const;

export const LOAN_TYPES = {
  HOME: 'home_loan',
  PERSONAL: 'personal_loan',
  VEHICLE: 'vehicle_loan',
  EDUCATION: 'education_loan',
  CREDIT_CARD: 'credit_card_debt'
} as const;

export const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transport', type: 'expense', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#45B7D1' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#96CEB4' },
  { name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#FECA57' },
  { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#FF9FF3' },
  { name: 'Education', type: 'expense', icon: '📚', color: '#54A0FF' },
  { name: 'Rent', type: 'expense', icon: '🏠', color: '#48DBFB' },
  { name: 'Insurance', type: 'expense', icon: '🛡️', color: '#0ABDE3' },
  { name: 'Others', type: 'expense', icon: '📌', color: '#C7ECEE' },
  
  // Income categories
  { name: 'Salary', type: 'income', icon: '💰', color: '#6C5CE7' },
  { name: 'Business', type: 'income', icon: '💼', color: '#A29BFE' },
  { name: 'Investment', type: 'income', icon: '📈', color: '#74B9FF' },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#81ECEC' },
  { name: 'Others', type: 'income', icon: '💵', color: '#55A3FF' }
];

export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Business logic errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED'
} as const;