import express from 'express';
import { getProfile, updateProfile, changeUserRole, getUsersByRole, deleteProfile } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-role', authMiddleware, changeUserRole);
router.get('/by-role/:role', authMiddleware, getUsersByRole);
router.delete('/profile', authMiddleware, deleteProfile);

export default router;
