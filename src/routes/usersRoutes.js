import express from 'express';
import { getAllUsers, createUser, updateUser } from '../controllers/usersController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);

export default router;