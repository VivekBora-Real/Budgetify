import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { addDays, subDays, subMonths, addMonths } from 'date-fns';

// Load environment variables
config();

// Import types
import { IUser } from '../models/user.model';

const DEMO_EMAIL = 'demo@budgetapp.com';
const DEMO_PASSWORD = 'Demo123!';

async function connectDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/budgetapp');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Dynamically get models to avoid recompilation errors
function getModels() {
  const User = mongoose.models.User || require('../models/user.model').default;
  const Account = mongoose.models.Account || require('../models/account.model').default;
  const Transaction = mongoose.models.Transaction || require('../models/transaction.model').default;
  const Investment = mongoose.models.Investment || require('../models/investment.model').default;
  const Loan = mongoose.models.Loan || require('../models/loan.model').default;
  const Reminder = mongoose.models.Reminder || require('../models/reminder.model').default;
  const Category = mongoose.models.Category || require('../models/category.model').default;
  
  return { User, Account, Transaction, Investment, Loan, Reminder, Category };
}

async function clearDemoData(userId: string) {
  console.log('🧹 Clearing existing demo data...');
  const { Transaction, Account, Investment, Loan, Reminder, Category } = getModels();
  
  await Promise.all([
    Transaction.deleteMany({ userId }),
    Account.deleteMany({ userId }),
    Investment.deleteMany({ userId }),
    Loan.deleteMany({ userId }),
    Reminder.deleteMany({ userId }),
    Category.deleteMany({ userId }),
  ]);
}

async function createDemoUser(): Promise<IUser> {
  console.log('👤 Creating demo user...');
  const { User } = getModels();
  
  let user = await User.findOne({ email: DEMO_EMAIL });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await User.create({
      email: DEMO_EMAIL,
      password: hashedPassword,
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        currency: 'USD',
        timezone: 'America/New_York'
      },
      isActive: true,
    });
    console.log('✅ Demo user created');
  } else {
    console.log('ℹ️  Demo user already exists');
  }
  
  return user!;
}

async function createCategories(userId: string) {
  console.log('📁 Creating categories...');
  const { Category } = getModels();
  
  const categories = [
    { name: 'Salary', type: 'income', color: '#10b981', icon: '💰' },
    { name: 'Freelance', type: 'income', color: '#06b6d4', icon: '💻' },
    { name: 'Investment Returns', type: 'income', color: '#8b5cf6', icon: '📈' },
    { name: 'Food & Dining', type: 'expense', color: '#f59e0b', icon: '🍔' },
    { name: 'Transportation', type: 'expense', color: '#3b82f6', icon: '🚗' },
    { name: 'Shopping', type: 'expense', color: '#ec4899', icon: '🛍️' },
    { name: 'Utilities', type: 'expense', color: '#06b6d4', icon: '💡' },
    { name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: '🎬' },
    { name: 'Healthcare', type: 'expense', color: '#ef4444', icon: '🏥' },
    { name: 'Rent', type: 'expense', color: '#f97316', icon: '🏠' },
  ];

  const createdCategories = await Category.create(
    categories.map(cat => ({ ...cat, userId }))
  );
  
  console.log(`✅ Created ${createdCategories.length} categories`);
  return createdCategories;
}

async function createAccounts(userId: string) {
  console.log('🏦 Creating accounts...');
  const { Account } = getModels();
  
  const accounts = [
    {
      userId,
      name: 'Main Checking',
      type: 'current',
      balance: 5250.75,
      currency: 'USD',
      color: '#3b82f6',
      isActive: true,
    },
    {
      userId,
      name: 'Savings Account',
      type: 'savings',
      balance: 15000.00,
      currency: 'USD',
      color: '#10b981',
      isActive: true,
    },
    {
      userId,
      name: 'Chase Credit Card',
      type: 'credit_card',
      balance: -2340.50,
      currency: 'USD',
      color: '#ef4444',
      isActive: true,
    },
    {
      userId,
      name: 'Emergency Fund',
      type: 'savings',
      balance: 8000.00,
      currency: 'USD',
      color: '#f59e0b',
      isActive: true,
    },
  ];

  const createdAccounts = await Account.create(accounts);
  console.log(`✅ Created ${createdAccounts.length} accounts`);
  return createdAccounts;
}

async function createTransactions(userId: string, accounts: any[]) {
  console.log('💸 Creating transactions...');
  const { Transaction } = getModels();
  
  const now = new Date();
  const transactions = [];

  // Last 3 months of transactions
  for (let i = 90; i >= 0; i--) {
    const date = subDays(now, i);
    
    // Monthly salary (1st of each month)
    if (date.getDate() === 1) {
      transactions.push({
        userId,
        accountId: accounts[0]._id, // Main Checking
        type: 'income',
        category: 'Salary',
        amount: 5000,
        description: 'Monthly Salary',
        date,
        isRecurring: true,
      });
    }

    // Rent payment (5th of each month)
    if (date.getDate() === 5) {
      transactions.push({
        userId,
        accountId: accounts[0]._id,
        type: 'expense',
        category: 'Rent',
        amount: 1800,
        description: 'Monthly Rent Payment',
        date,
        isRecurring: true,
      });
    }

    // Random daily expenses
    if (Math.random() > 0.3) {
      const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment'];
      const randomCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      
      transactions.push({
        userId,
        accountId: Math.random() > 0.7 ? accounts[2]._id : accounts[0]._id, // Credit card or checking
        type: 'expense',
        category: randomCategory,
        amount: Math.random() * 100 + 10,
        description: getRandomDescription(randomCategory),
        date,
      });
    }

    // Occasional income
    if (Math.random() > 0.95) {
      transactions.push({
        userId,
        accountId: accounts[0]._id,
        type: 'income',
        category: 'Freelance',
        amount: Math.random() * 500 + 200,
        description: 'Freelance Project Payment',
        date,
      });
    }
  }

  // Utility bills
  for (let i = 2; i >= 0; i--) {
    const date = subMonths(now, i);
    transactions.push({
      userId,
      accountId: accounts[0]._id,
      type: 'expense',
      category: 'Utilities',
      amount: 150 + Math.random() * 50,
      description: 'Electricity Bill',
      date: new Date(date.getFullYear(), date.getMonth(), 15),
    });
  }

  const createdTransactions = await Transaction.create(transactions);
  console.log(`✅ Created ${createdTransactions.length} transactions`);
  
  // Update account balances
  const { Account } = getModels();
  for (const account of accounts) {
    const accountTransactions = createdTransactions.filter(
      t => t.accountId.toString() === account._id.toString()
    );
    
    let balance = account.type === 'credit_card' ? 0 : account.balance;
    
    for (const transaction of accountTransactions) {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    }
    
    await Account.findByIdAndUpdate(account._id, { balance });
  }
  
  console.log('✅ Updated account balances');
  return createdTransactions;
}

async function createInvestments(userId: string) {
  console.log('📈 Creating investments...');
  const { Investment } = getModels();
  
  const investments = [
    {
      userId,
      name: 'Apple Inc.',
      type: 'stocks',
      symbol: 'AAPL',
      quantity: 50,
      purchasePrice: 150,
      currentPrice: 180,
      purchaseDate: subMonths(new Date(), 6),
      broker: 'Robinhood',
      notes: 'Long-term growth stock',
    },
    {
      userId,
      name: 'Vanguard S&P 500 ETF',
      type: 'etf',
      symbol: 'VOO',
      quantity: 20,
      purchasePrice: 400,
      currentPrice: 420,
      purchaseDate: subMonths(new Date(), 8),
      broker: 'Vanguard',
      notes: 'Index fund for diversification',
    },
    {
      userId,
      name: 'Bitcoin',
      type: 'crypto',
      symbol: 'BTC',
      quantity: 0.5,
      purchasePrice: 30000,
      currentPrice: 45000,
      purchaseDate: subMonths(new Date(), 12),
      broker: 'Coinbase',
      notes: 'Cryptocurrency investment',
    },
    {
      userId,
      name: 'Tesla Inc.',
      type: 'stocks',
      symbol: 'TSLA',
      quantity: 10,
      purchasePrice: 200,
      currentPrice: 180,
      purchaseDate: subMonths(new Date(), 3),
      broker: 'Robinhood',
      notes: 'Electric vehicle leader',
    },
    {
      userId,
      name: 'US Treasury Bonds',
      type: 'bonds',
      quantity: 10,
      purchasePrice: 1000,
      currentPrice: 1020,
      purchaseDate: subMonths(new Date(), 4),
      broker: 'TreasuryDirect',
      notes: 'Safe investment',
    },
  ];

  const createdInvestments = await Investment.create(investments);
  console.log(`✅ Created ${createdInvestments.length} investments`);
  return createdInvestments;
}

async function createLoans(userId: string) {
  console.log('💳 Creating loans...');
  const { Loan } = getModels();
  
  const loans = [
    {
      userId,
      loanName: 'Home Mortgage',
      loanType: 'mortgage',
      lender: 'Wells Fargo',
      principalAmount: 300000,
      currentBalance: 285000,
      interestRate: 3.5,
      monthlyPayment: 1800,
      startDate: subMonths(new Date(), 24),
      endDate: addMonths(new Date(), 336), // 28 years remaining
      nextPaymentDate: addDays(new Date(), 5),
      status: 'active',
      notes: 'Primary residence mortgage',
    },
    {
      userId,
      loanName: 'Car Loan',
      loanType: 'auto',
      lender: 'Toyota Financial',
      principalAmount: 30000,
      currentBalance: 18000,
      interestRate: 4.5,
      monthlyPayment: 550,
      startDate: subMonths(new Date(), 18),
      endDate: addMonths(new Date(), 42), // 3.5 years remaining
      nextPaymentDate: addDays(new Date(), 12),
      status: 'active',
      notes: '2022 Toyota Camry',
    },
    {
      userId,
      loanName: 'Student Loan',
      loanType: 'student',
      lender: 'Federal Student Aid',
      principalAmount: 40000,
      currentBalance: 0,
      interestRate: 5.0,
      monthlyPayment: 0,
      startDate: subMonths(new Date(), 60),
      endDate: subMonths(new Date(), 6),
      nextPaymentDate: subMonths(new Date(), 6),
      status: 'paid_off',
      notes: 'Bachelor degree loan - Paid off!',
    },
  ];

  const createdLoans = await Loan.create(loans);
  console.log(`✅ Created ${createdLoans.length} loans`);
  return createdLoans;
}

async function createReminders(userId: string) {
  console.log('⏰ Creating reminders...');
  const { Reminder } = getModels();
  
  const reminders = [
    {
      userId,
      title: 'Electricity Bill',
      description: 'Pay monthly electricity bill',
      dueDate: addDays(new Date(), 7),
      amount: 120,
      category: 'Utilities',
      frequency: 'monthly',
      isActive: true,
    },
    {
      userId,
      title: 'Internet Bill',
      description: 'Comcast internet payment',
      dueDate: addDays(new Date(), 10),
      amount: 80,
      category: 'Utilities',
      frequency: 'monthly',
      isActive: true,
    },
    {
      userId,
      title: 'Car Insurance',
      description: 'Quarterly car insurance payment',
      dueDate: addDays(new Date(), 20),
      amount: 450,
      category: 'Insurance',
      frequency: 'quarterly',
      isActive: true,
    },
    {
      userId,
      title: 'Annual Gym Membership',
      description: 'Renew gym membership',
      dueDate: addMonths(new Date(), 2),
      amount: 600,
      category: 'Health',
      frequency: 'yearly',
      isActive: true,
    },
  ];

  const createdReminders = await Reminder.create(reminders);
  console.log(`✅ Created ${createdReminders.length} reminders`);
  return createdReminders;
}

function getRandomDescription(category: string): string {
  const descriptions: Record<string, string[]> = {
    'Food & Dining': ['Lunch at restaurant', 'Grocery shopping', 'Coffee shop', 'Dinner with friends', 'Fast food'],
    'Transportation': ['Gas station', 'Uber ride', 'Bus pass', 'Car maintenance', 'Parking fee'],
    'Shopping': ['Amazon purchase', 'Clothing store', 'Electronics', 'Home supplies', 'Books'],
    'Entertainment': ['Movie tickets', 'Concert', 'Netflix subscription', 'Gaming', 'Sports event'],
  };
  
  const options = descriptions[category] || ['Purchase'];
  return options[Math.floor(Math.random() * options.length)];
}

async function seedDemoData() {
  try {
    await connectDB();
    
    // Create demo user
    const demoUser = await createDemoUser();
    
    const userId = demoUser._id.toString();
    
    // Clear existing demo data
    await clearDemoData(userId);
    
    // Create all demo data
    await createCategories(userId);
    const accounts = await createAccounts(userId);
    await createTransactions(userId, accounts);
    await createInvestments(userId);
    await createLoans(userId);
    await createReminders(userId);
    
    console.log('\n✅ Demo data seeded successfully!');
    console.log('\n📧 Demo Account Credentials:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    
    // Close connection if this is run as standalone script
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDemoData();