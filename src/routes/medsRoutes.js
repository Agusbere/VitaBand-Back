import express from 'express';
import { meds } from '../controllers/medsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, meds.getAll);
router.post('', authMiddleware, meds.create);
router.put('/:id', authMiddleware, meds.update);
router.delete('/:id', authMiddleware, meds.delete);

export default router;
