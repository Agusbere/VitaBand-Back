import express from 'express';
import { reminder } from '../controllers/reminderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, reminder.getAll);
router.post('', authMiddleware, reminder.create);
router.put('/:id', authMiddleware, reminder.update);
router.delete('/:id', authMiddleware, reminder.delete);

export default router;
