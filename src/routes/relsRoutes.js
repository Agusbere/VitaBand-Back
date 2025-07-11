import express from 'express';
import { rels } from '../controllers/relsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, rels.getAll);
router.post('', authMiddleware, rels.create);
router.put('/:id', authMiddleware, rels.update);
router.delete('/:id', authMiddleware, rels.delete);

export default router;
