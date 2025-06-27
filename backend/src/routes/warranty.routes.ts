import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (_req, res) => {
  res.json({ message: 'Get all warranties - To be implemented' });
});

router.post('/', (_req, res) => {
  res.json({ message: 'Create warranty - To be implemented' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: 'Get warranty by ID - To be implemented' });
});

router.put('/:id', (_req, res) => {
  res.json({ message: 'Update warranty - To be implemented' });
});

router.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete warranty - To be implemented' });
});

export default router;