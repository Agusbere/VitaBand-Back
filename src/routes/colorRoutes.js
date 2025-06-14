import express from 'express';
import { getAllColors, createColor, updateColor } from '../controllers/colorController.js';

const router = express.Router();

router.get('/color', getAllColors);
router.post('/color', createColor);
router.put('/color/:id', updateColor);

export default router;