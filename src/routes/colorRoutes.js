import express from 'express';
import { color } from '../controllers/colorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, color.getAll);
router.post('', authMiddleware, color.create);
router.put('/:id', authMiddleware, color.update);
router.delete('/:id', authMiddleware, color.delete);

export default router;
