import express from 'express';
import { getAllRels, createRel, updateRel } from '../controllers/relsController.js';

const router = express.Router();

router.get('/rels', getAllRels);
router.post('/rels', createRel);
router.put('/rels/:id', updateRel);

export default router;