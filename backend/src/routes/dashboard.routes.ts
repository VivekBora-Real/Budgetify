import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ message: 'Get dashboard data - To be implemented' });
});

router.get('/summary', (req, res) => {
  res.json({ message: 'Get dashboard summary - To be implemented' });
});

router.get('/charts', (req, res) => {
  res.json({ message: 'Get dashboard charts data - To be implemented' });
});

router.get('/recent-activities', (req, res) => {
  res.json({ message: 'Get recent activities - To be implemented' });
});

router.get('/statistics', (req, res) => {
  res.json({ message: 'Get dashboard statistics - To be implemented' });
});

export default router;