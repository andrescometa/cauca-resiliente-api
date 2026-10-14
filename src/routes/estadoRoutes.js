// Importamos express
import express from 'express';

// Importamos las funciones del controlador
import { actualizarEstado, consultarEstado } from '../controllers/estadoController.js';

// Creamos el router
const router = express.Router();

// PUT /api/estados/:usuarioId → actualizar
router.put('/:usuarioId', actualizarEstado);

// GET /api/estados/:usuarioId → consultar
router.get('/:usuarioId', consultarEstado);

// Exportamos
export default router;