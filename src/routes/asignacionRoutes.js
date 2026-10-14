import express from 'express';

// Importamos las funciones del controlador
import { crearAsignacion, actualizarAsignacion } from '../controllers/asignacionController.js';

// Creamos el router
const router = express.Router();

// POST /api/asignaciones → crear
router.post('/', crearAsignacion);

// PUT /api/asignaciones/:id → actualizar estado
router.put('/:id', actualizarAsignacion);

// Exportamos
export default router;