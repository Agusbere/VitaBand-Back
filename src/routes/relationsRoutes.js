import express from 'express';
import { relations } from '../controllers/relationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, relations.getAll);
router.post('', authMiddleware, relations.create);
router.put('/:id', authMiddleware, relations.update);
router.delete('/:id', authMiddleware, relations.delete);

export default router;
