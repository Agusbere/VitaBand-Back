import express from 'express';
import { getAllMedications, createMedication, updateMedication } from '../controllers/medicationController.js';

const router = express.Router();

router.get('/medication', getAllMedications);
router.post('/medication', createMedication);
router.put('/medication/:id', updateMedication);

export default router;