import express from 'express';
import { getProfile, updateProfile, deleteProfile, updateExtraData1, updateExtraData2, uploadProfilePicture } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('image'), updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.put('/extra-data-1', authMiddleware, updateExtraData1);
router.put('/extra-data-2', authMiddleware, updateExtraData2);
router.post('/upload-picture', authMiddleware, upload.single('image'), uploadProfilePicture);

export default router;
