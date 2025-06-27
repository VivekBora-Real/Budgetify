import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from '../utils/constants';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: any
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || ERROR_CODES.INTERNAL_ERROR;
  let details = err.details;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = ERROR_CODES.INVALID_INPUT;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = ERROR_CODES.TOKEN_INVALID;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token expired';
  }
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && details && { details })
    }
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};