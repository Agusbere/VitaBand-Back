import express from 'express';
import { getProfile, updateProfile, deleteProfile, updateExtraData1, updateExtraData2, uploadProfilePicture, getProfilePictureUrl, updateProfilePictureUrl } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('image'), updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.put('/extra-data-1', authMiddleware, updateExtraData1);
router.put('/extra-data-2', authMiddleware, upload.single('image'), updateExtraData2);
router.post('/upload-picture', authMiddleware, upload.single('image'), uploadProfilePicture);
router.get('/profile-picture-url', authMiddleware, getProfilePictureUrl);
router.put('/update-profile-picture-url', authMiddleware, updateProfilePictureUrl);

export default router;
