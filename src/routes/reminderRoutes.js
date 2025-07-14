import express from 'express';
import { getAllReminders, getReminderById, createReminder, updateReminder, deleteReminder } from '../controllers/reminderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllReminders);
router.get('/:id', authMiddleware, getReminderById);
router.post('/', authMiddleware, createReminder);
router.put('/:id', authMiddleware, updateReminder);
router.delete('/:id', authMiddleware, deleteReminder);

export default router;
