import express from 'express';
import { getAllReminders, createReminder, updateReminder } from '../controllers/reminderController.js';

const router = express.Router();

router.get('/reminder', getAllReminders);
router.post('/reminder', createReminder);
router.put('/reminder/:id', updateReminder);

export default router;