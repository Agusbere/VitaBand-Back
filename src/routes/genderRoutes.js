import express from 'express';
import { getAllGenders, createGender, updateGender } from '../controllers/genderController.js';

const router = express.Router();

router.get('/gender', getAllGenders);
router.post('/gender', createGender);
router.put('/gender/:id', updateGender);

export default router;
