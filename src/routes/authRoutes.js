import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { limitarLogin } from '../middleware/rateLimit.js';
const router = express.Router();
router.post('/login', limitarLogin, login);
router.post('/register', register);
router.get('/profile', profile);
export default router;
