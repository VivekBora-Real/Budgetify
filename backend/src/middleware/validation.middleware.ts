import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from './error.middleware';
import { ERROR_CODES } from '../utils/constants';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : undefined,
      message: err.msg
    }));
    
    next(
      createError(
        'Validation failed',
        400,
        ERROR_CODES.VALIDATION_ERROR,
        errorDetails
      )
    );
  } else {
    next();
  }
};