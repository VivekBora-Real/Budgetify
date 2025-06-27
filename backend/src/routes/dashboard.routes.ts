import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (_req, res) => {
  res.json({ message: 'Get dashboard data - To be implemented' });
});

router.get('/summary', (_req, res) => {
  res.json({ message: 'Get dashboard summary - To be implemented' });
});

router.get('/charts', (_req, res) => {
  res.json({ message: 'Get dashboard charts data - To be implemented' });
});

router.get('/recent-activities', (_req, res) => {
  res.json({ message: 'Get recent activities - To be implemented' });
});

router.get('/statistics', (_req, res) => {
  res.json({ message: 'Get dashboard statistics - To be implemented' });
});

export default router;