import express from 'express';
import { users } from '../controllers/usersController.js';

const router = express.Router();

router.get('', users.getAll);
router.post('', users.create);
router.put('/:id', users.update);
router.delete('/:id', users.delete);

export default router;
