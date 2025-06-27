import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ message: 'Get all reminders - To be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create reminder - To be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get reminder by ID - To be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update reminder - To be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete reminder - To be implemented' });
});

export default router;