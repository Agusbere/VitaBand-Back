import express from 'express';
import { createRelation, getMyRelations, deleteRelation, getRelationById, confirmRelation, searchUsers, getPendingInvitations, confirmAllInvitations, getConfirmedAsHost, denyRelation, searchConfirmedUsers } from '../controllers/relationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getMyRelations);
router.get('/search-users', authMiddleware, searchUsers);
router.get('/search-confirmed', authMiddleware, searchConfirmedUsers);
router.get('/pending', authMiddleware, getPendingInvitations);
router.get('/confirmed', authMiddleware, getConfirmedAsHost);
router.get('/:id', authMiddleware, getRelationById);
router.post('/', authMiddleware, createRelation);
router.delete('/:id', authMiddleware, deleteRelation);
router.patch('/confirm', authMiddleware, confirmRelation);
router.patch('/confirm-all', authMiddleware, confirmAllInvitations);
router.patch('/deny', authMiddleware, denyRelation);

export default router;
