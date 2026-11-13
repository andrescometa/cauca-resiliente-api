import express from 'express';

// Importamos las funciones del controlador
import { crearAsignacion, actualizarAsignacion, listarAsignacionesPorSocorrista } from '../controllers/asignacionController.js';

// Creamos el router
const router = express.Router();

// POST /api/asignaciones → crear
router.post('/', crearAsignacion);

// GET /api/asignaciones/socorrista/:socorristaId → solicitudes asignadas
router.get('/socorrista/:socorristaId', listarAsignacionesPorSocorrista);

// PUT /api/asignaciones/:id → actualizar estado
router.put('/:id', actualizarAsignacion);

// Exportamos
export default router;