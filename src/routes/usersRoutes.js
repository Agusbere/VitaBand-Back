import express from 'express';
import { users } from '../controllers/usersController.js';
import { updateExtraData1, updateExtraData2, updateExtraData3 } from '../controllers/usersController.js';

const router = express.Router();

router.get('', users.getAll);
router.post('', users.create);
router.put('/:id', users.update);
router.delete('/:id', users.delete);
router.patch('/:id/nombre', updateExtraData1);
router.patch('/:id/genero', updateExtraData2);
router.patch('/:id/foto', updateExtraData3);

export default router;
