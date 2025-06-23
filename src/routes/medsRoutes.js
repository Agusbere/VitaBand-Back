import express from 'express';
import { meds } from '../controllers/medsController.js';

const router = express.Router();

router.get('', meds.getAll);
router.post('', meds.create);
router.put('/:id', meds.update);
router.delete('/:id', meds.delete);

export default router;
