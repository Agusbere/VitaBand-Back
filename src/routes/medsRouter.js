import express from 'express';
import {
    getAllMeds,
    getMedById,
    createMed,
    updateMed,
    deleteMed
} from '../controllers/medsController.js';

const router = express.Router();

router.get('/meds', getAllMeds);
router.get('/meds/:id', getMedById);
router.post('/meds', createMed);
router.put('/meds/:id', updateMed);
router.delete('/meds/:id', deleteMed);

export default router;
