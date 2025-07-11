import express from 'express';
import { medication, getMedicationByIdWithUser } from '../controllers/medicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, medication.getAll);
router.post('', authMiddleware, medication.create);
router.put('/:id', authMiddleware, medication.update);
router.delete('/:id', authMiddleware, medication.delete);
router.get('/:id/details', authMiddleware, getMedicationByIdWithUser);

export default router;
