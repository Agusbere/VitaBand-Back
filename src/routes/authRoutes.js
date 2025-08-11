import express from 'express';
import { login, register, verifyToken, getTokenByUserId } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', authMiddleware, verifyToken);
router.get('/token/:id', getTokenByUserId);

export default router;
