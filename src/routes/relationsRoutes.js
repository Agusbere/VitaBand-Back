import express from 'express';
import { createRelation, getMyRelations, findAvailableUsers, deleteRelation, getRelationById } from '../controllers/relationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getMyRelations);
router.get('/available-users', authMiddleware, findAvailableUsers);
router.get('/:id', authMiddleware, getRelationById);
router.post('/', authMiddleware, createRelation);
router.delete('/:id', authMiddleware, deleteRelation);

export default router;
