import express from 'express';
import { getProfile, updateProfile, deleteProfile, updateExtraData1, updateExtraData2 } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.put('/extra-data-1', authMiddleware, updateExtraData1);
router.put('/extra-data-2', authMiddleware, updateExtraData2);

export default router;
