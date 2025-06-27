import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';

export const register = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName } = req.body;
  
  const { user, tokens } = await authService.register(
    email,
    password,
    firstName,
    lastName
  );
  
  res.status(201).json({
    data: {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      },
      tokens
    },
    message: 'Registration successful'
  });
});

export const login = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  
  const { user, tokens } = await authService.login(email, password);
  
  res.json({
    data: {
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      },
      tokens
    },
    message: 'Login successful'
  });
});

export const refreshToken = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;
  
  const tokens = await authService.refreshToken(refreshToken);
  
  res.json({
    data: { tokens },
    message: 'Token refreshed successfully'
  });
});

export const logout = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // In a production app, you might want to blacklist the token here
  // For now, we'll just send a success response
  res.json({
    message: 'Logout successful'
  });
});