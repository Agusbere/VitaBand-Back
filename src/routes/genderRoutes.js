import express from 'express';
import { gender } from '../controllers/genderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, gender.getAll);
router.post('', authMiddleware, gender.create);
router.put('/:id', authMiddleware, gender.update);
router.delete('/:id', authMiddleware, gender.delete);

export default router;
