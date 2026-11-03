import express from 'express';
import { getMapPoints } from '../controllers/mapController.js';

const router = express.Router();

// GET /api/map/points -> usuarios con ubicación registrada
router.get('/points', getMapPoints);

export default router;
