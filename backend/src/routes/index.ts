import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import accountRoutes from './account.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import dashboardRoutes from './dashboard.routes';
import reminderRoutes from './reminder.routes';
import warrantyRoutes from './warranty.routes';
import investmentRoutes from './investment.routes';
import loanRoutes from './loan.routes';

const router = Router();

// API version
router.get('/', (req, res) => {
  res.json({
    message: 'BudgetApp API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      categories: '/api/categories',
      dashboard: '/api/dashboard',
      reminders: '/api/reminders',
      warranties: '/api/warranties',
      investments: '/api/investments',
      loans: '/api/loans'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reminders', reminderRoutes);
router.use('/warranties', warrantyRoutes);
router.use('/investments', investmentRoutes);
router.use('/loans', loanRoutes);

export default router;