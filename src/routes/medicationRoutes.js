import express from 'express';
import { medication, getMedicationByIdWithUser } from '../controllers/medicationController.js';

const router = express.Router();

router.get('', medication.getAll);
router.post('', medication.create);
router.put('/:id', medication.update);
router.delete('/:id', medication.delete);
router.get('/:id/details', getMedicationByIdWithUser);

export default router;
