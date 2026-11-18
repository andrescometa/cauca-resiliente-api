import express from 'express';
import { guardarToken } from '../controllers/deviceTokenController.js';

const router = express.Router();
router.post('/', guardarToken);

export default router;