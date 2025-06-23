import express from 'express';
import { reminder } from '../controllers/reminderController.js';

const router = express.Router();

router.get('', reminder.getAll);
router.post('', reminder.create);
router.put('/:id', reminder.update);
router.delete('/:id', reminder.delete);

export default router;
