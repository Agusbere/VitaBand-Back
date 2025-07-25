import express from 'express';
import { createRelation, getMyRelations, findAvailableUsers, deleteRelation, getRelationById, confirmRelation, searchUsers } from '../controllers/relationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getMyRelations);
router.get('/available-users', authMiddleware, findAvailableUsers);
router.get('/search-users', authMiddleware, searchUsers);
router.get('/:id', authMiddleware, getRelationById);
router.post('/', authMiddleware, createRelation);
router.delete('/:id', authMiddleware, deleteRelation);
router.patch('/:id/confirm', authMiddleware, confirmRelation);

export default router;
