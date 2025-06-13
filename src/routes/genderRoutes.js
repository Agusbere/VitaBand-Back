import express from 'express';
import { getAllGenders, createGender } from '../controllers/genderController.js';

const router = express.Router();

router.get('/genders', getAllGenders);
router.post('/genders', createGender);

export default router;
