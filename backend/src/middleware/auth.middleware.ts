import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthPayload } from '../types';
import { createError } from './error.middleware';
import { ERROR_CODES } from '../utils/constants';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw createError('No token provided', 401, ERROR_CODES.UNAUTHORIZED);
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expired', 401, ERROR_CODES.TOKEN_EXPIRED));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401, ERROR_CODES.TOKEN_INVALID));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as AuthPayload;
      
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};