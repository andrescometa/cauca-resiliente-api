import express from 'express';
import { profile, updateLocation } from '../controllers/authController.js';
const router = express.Router();
router.get('/profile', profile);
router.post('/location', updateLocation);
export default router;
