import express from 'express';

// Importamos las funciones del controlador
import { crearZonaRiesgo, listarZonas, consultarZonasCercanas } from '../controllers/zonaRiesgoController.js';

// Creamos el router
const router = express.Router();

// GET /api/zonas-riesgo → listar todas las zonas activas
router.get('/', listarZonas);

// GET /api/zonas-riesgo/cercanas → consultar cercanas
router.get('/cercanas', consultarZonasCercanas);

// POST /api/zonas-riesgo → crear
router.post('/', crearZonaRiesgo);

// Exportamos
export default router;
