import express from 'express';
import { rels } from '../controllers/relsController.js';

const router = express.Router();

router.get('', rels.getAll);
router.post('', rels.create);
router.put('/:id', rels.update);
router.delete('/:id', rels.delete);

export default router;
