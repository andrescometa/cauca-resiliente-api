import express from 'express';

// Importamos las funciones del controlador
import { crearZonaRiesgo, consultarZonasCercanas } from '../controllers/zonaRiesgoController.js';

// Creamos el router
const router = express.Router();

// POST /api/zonas-riesgo → crear
router.post('/', crearZonaRiesgo);

// GET /api/zonas-riesgo/cercanas → consultar cercanas
router.get('/cercanas', consultarZonasCercanas);

// Exportamos
export default router;