import { Router } from 'express';
import {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  recordPayment,
  getLoanStats,
} from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query } from 'express-validator';

const router = Router();

const createLoanValidation = [
  body('loanName').notEmpty().withMessage('Loan name is required'),
  body('loanType').isIn(['personal', 'mortgage', 'auto', 'student', 'business', 'other'])
    .withMessage('Invalid loan type'),
  body('lender').notEmpty().withMessage('Lender is required'),
  body('principalAmount').isFloat({ min: 0 }).withMessage('Principal amount must be a positive number'),
  body('interestRate').isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('monthlyPayment').isFloat({ min: 0 }).withMessage('Monthly payment must be a positive number'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('nextPaymentDate').isISO8601().withMessage('Next payment date must be a valid date'),
];

const updateLoanValidation = [
  body('loanName').optional().notEmpty().withMessage('Loan name cannot be empty'),
  body('loanType').optional().isIn(['personal', 'mortgage', 'auto', 'student', 'business', 'other'])
    .withMessage('Invalid loan type'),
  body('lender').optional().notEmpty().withMessage('Lender cannot be empty'),
  body('principalAmount').optional().isFloat({ min: 0 }).withMessage('Principal amount must be a positive number'),
  body('currentBalance').optional().isFloat({ min: 0 }).withMessage('Current balance must be a positive number'),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('monthlyPayment').optional().isFloat({ min: 0 }).withMessage('Monthly payment must be a positive number'),
  body('status').optional().isIn(['active', 'paid_off', 'defaulted']).withMessage('Invalid status'),
];

const recordPaymentValidation = [
  body('amount').isFloat({ min: 0 }).withMessage('Payment amount must be a positive number'),
];

router.use(authenticate);

router.get('/', 
  query('type').optional().isIn(['personal', 'mortgage', 'auto', 'student', 'business', 'other']),
  query('status').optional().isIn(['active', 'paid_off', 'defaulted']),
  query('sortBy').optional().isIn(['nextPaymentDate', 'currentBalance', 'monthlyPayment', 'loanName']),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest, 
  getLoans);
router.get('/stats', getLoanStats);
router.get('/:id', getLoanById);
router.post('/', createLoanValidation, validateRequest, createLoan);
router.put('/:id', updateLoanValidation, validateRequest, updateLoan);
router.post('/:id/payment', recordPaymentValidation, validateRequest, recordPayment);
router.delete('/:id', deleteLoan);

export default router;