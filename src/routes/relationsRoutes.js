import express from 'express';
import { relations } from '../controllers/relationsController.js';

const router = express.Router();

router.get('', relations.getAll);
router.post('', relations.create);
router.put('/:id', relations.update);
router.delete('/:id', relations.delete);

export default router;
