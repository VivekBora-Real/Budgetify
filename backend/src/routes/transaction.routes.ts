import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query, param } from 'express-validator';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} from '../controllers/transaction.controller';

const router = Router();

// All routes are protected
router.use(authenticate);

// Validation rules
const transactionValidation = [
  body('accountId').isMongoId().withMessage('Valid account ID is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isRecurring').optional().isBoolean(),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('accountId').optional().isMongoId().withMessage('Valid account ID required'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('startDate').optional().isISO8601().withMessage('Valid start date required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date required')
];

// Routes
router.get(
  '/',
  queryValidation,
  validateRequest,
  getTransactions
);

router.get(
  '/stats',
  query('period').optional().isIn(['week', 'month', 'year']),
  validateRequest,
  getTransactionStats
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Valid transaction ID required'),
  validateRequest,
  getTransaction
);

router.post(
  '/',
  transactionValidation,
  validateRequest,
  createTransaction
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Valid transaction ID required'),
  transactionValidation,
  validateRequest,
  updateTransaction
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Valid transaction ID required'),
  validateRequest,
  deleteTransaction
);

export default router;