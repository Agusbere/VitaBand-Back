import express from 'express';
import { getAllRelations, createRelation, updateRelation } from '../controllers/relationsController.js';

const router = express.Router();

router.get('/relations', getAllRelations);
router.post('/relations', createRelation);
router.put('/relations/:id', updateRelation);

export default router;