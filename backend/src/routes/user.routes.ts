import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - To be implemented' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - To be implemented' });
});

router.put('/preferences', (req, res) => {
  res.json({ message: 'Update user preferences - To be implemented' });
});

export default router;