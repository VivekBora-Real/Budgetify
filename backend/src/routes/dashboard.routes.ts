import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getDashboardData,
  getRecentTransactions,
  getExpenseBreakdown,
  getBudgetProgress,
  getUpcomingBills
} from '../controllers/dashboard.controller';

const router = Router();

// All routes are protected
router.use(authenticate);

// Dashboard routes
router.get('/overview', getDashboardData);
router.get('/recent-transactions', getRecentTransactions);
router.get('/expense-breakdown', getExpenseBreakdown);
router.get('/budget-progress', getBudgetProgress);
router.get('/upcoming-bills', getUpcomingBills);

export default router;