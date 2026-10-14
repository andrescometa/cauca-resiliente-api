import express from 'express';

// Importamos las funciones del controlador
import { crearSolicitud, listarSolicitudes } from '../controllers/solicitudController.js';

// Creamos el router
const router = express.Router();

// POST /api/solicitudes → crear
router.post('/', crearSolicitud);

// GET /api/solicitudes → listar priorizadas
router.get('/', listarSolicitudes);

// Exportamos
export default router;