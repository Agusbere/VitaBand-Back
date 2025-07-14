import express from 'express';
import { getAllMedications, getMedicationById, createMedication, updateMedication, deleteMedication } from '../controllers/medicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllMedications);
router.get('/:id', authMiddleware, getMedicationById);
router.post('/', authMiddleware, createMedication);
router.put('/:id', authMiddleware, updateMedication);
router.delete('/:id', authMiddleware, deleteMedication);

export default router;
