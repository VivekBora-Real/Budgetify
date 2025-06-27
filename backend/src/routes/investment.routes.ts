import { Router } from 'express';
import {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats,
} from '../controllers/investment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query } from 'express-validator';

const router = Router();

const createInvestmentValidation = [
  body('name').notEmpty().withMessage('Investment name is required'),
  body('type').isIn(['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'other'])
    .withMessage('Invalid investment type'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('currentPrice').isFloat({ min: 0 }).withMessage('Current price must be a positive number'),
  body('purchaseDate').isISO8601().withMessage('Purchase date must be a valid date'),
  body('broker').notEmpty().withMessage('Broker is required'),
];

const updateInvestmentValidation = [
  body('name').optional().notEmpty().withMessage('Investment name cannot be empty'),
  body('type').optional().isIn(['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'other'])
    .withMessage('Invalid investment type'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('currentPrice').optional().isFloat({ min: 0 }).withMessage('Current price must be a positive number'),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
  body('broker').optional().notEmpty().withMessage('Broker cannot be empty'),
];

router.use(authenticate);

router.get('/', 
  query('type').optional().isIn(['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'other']),
  query('sortBy').optional().isIn(['purchaseDate', 'name', 'currentValue', 'gainLoss']),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest, 
  getInvestments);
router.get('/stats', getInvestmentStats);
router.get('/:id', getInvestmentById);
router.post('/', createInvestmentValidation, validateRequest, createInvestment);
router.put('/:id', updateInvestmentValidation, validateRequest, updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;