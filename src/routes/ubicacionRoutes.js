import express from 'express';

// Importamos las funciones del controlador
import { crearUbicacion, consultarHistorial } from '../controllers/ubicacionController.js';

// Creamos el router
const router = express.Router();

// POST /api/ubicaciones → crear
router.post('/', crearUbicacion);

// GET /api/ubicaciones/:usuarioId → consultar historial
router.get('/:usuarioId', consultarHistorial);

// Exportamos
export default router;