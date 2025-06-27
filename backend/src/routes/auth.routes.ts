import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { 
  registerValidator, 
  loginValidator, 
  refreshTokenValidator 
} from '../validators/auth.validator';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/refresh', refreshTokenValidator, validateRequest, refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);

export default router;