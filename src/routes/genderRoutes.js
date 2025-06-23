import express from 'express';
import { gender } from '../controllers/genderController.js';

const router = express.Router();

router.get('', gender.getAll);
router.post('', gender.create);
router.put('/:id', gender.update);
router.delete('/:id', gender.delete);

export default router;
