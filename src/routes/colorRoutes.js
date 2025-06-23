import express from 'express';
import { color } from '../controllers/colorController.js';

const router = express.Router();

router.get('', color.getAll);
router.post('', color.create);
router.put('/:id', color.update);
router.delete('/:id', color.delete);

export default router;
