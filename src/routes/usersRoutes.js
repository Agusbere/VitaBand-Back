import express from 'express';
import { getProfile, updateProfile, deleteProfile, updateBasicData, updateProfilePicture, getBasicData } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.put('/basic-data', authMiddleware, updateBasicData);
router.put('/profile-picture', authMiddleware, updateProfilePicture);
router.get('/basic-data', authMiddleware, getBasicData);

export default router;
