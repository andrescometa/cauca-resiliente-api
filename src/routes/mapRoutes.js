import express from 'express';
import { getMapPoints } from '../controllers/mapController.js';
import { getAlertasMapa } from '../controllers/mapController.js';

const router = express.Router();

// GET /api/map/points -> usuarios con ubicación registrada
router.get('/points', getMapPoints);
// routes/mapRoutes.js
router.get('/alerts', getAlertasMapa);

export default router;
