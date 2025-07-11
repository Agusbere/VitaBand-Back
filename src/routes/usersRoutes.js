import express from 'express';
import { users } from '../controllers/usersController.js';
import { updateExtraData1, updateExtraData2, updateExtraData3 } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('', authMiddleware, users.getAll);
router.post('', authMiddleware, users.create);
router.put('/:id', authMiddleware, users.update);
router.delete('/:id', authMiddleware, users.delete);
router.patch('/:id/nombre', authMiddleware, updateExtraData1);
router.patch('/:id/genero', authMiddleware, updateExtraData2);
router.patch('/:id/foto', authMiddleware, updateExtraData3);

export default router;
