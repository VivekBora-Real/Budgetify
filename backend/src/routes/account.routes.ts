import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query, param } from 'express-validator';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountStats
} from '../controllers/account.controller';

const router = Router();

// All routes are protected
router.use(authenticate);

// Validation rules
const accountValidation = [
  body('name').notEmpty().trim().withMessage('Account name is required'),
  body('type')
    .isIn(['savings', 'current', 'credit_card', 'cash', 'digital_wallet'])
    .withMessage('Invalid account type'),
  body('balance').isFloat({ min: 0 }).withMessage('Balance must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex code'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean()
];

const updateAccountValidation = [
  body('name').optional().notEmpty().trim().withMessage('Account name cannot be empty'),
  body('type')
    .optional()
    .isIn(['savings', 'current', 'credit_card', 'cash', 'digital_wallet'])
    .withMessage('Invalid account type'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex code'),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean()
];

// Routes
router.get(
  '/',
  query('isActive').optional().isBoolean(),
  validateRequest,
  getAccounts
);

router.get('/stats', getAccountStats);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Valid account ID required'),
  validateRequest,
  getAccount
);

router.post(
  '/',
  accountValidation,
  validateRequest,
  createAccount
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Valid account ID required'),
  updateAccountValidation,
  validateRequest,
  updateAccount
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Valid account ID required'),
  validateRequest,
  deleteAccount
);

export default router;