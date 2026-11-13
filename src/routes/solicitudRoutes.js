// ===== ARCHIVO: routes/solicitudRoutes.js =====
import express from 'express';
import { 
  crearSolicitud, 
  listarSolicitudes, 
  actualizarSolicitud, 
  obtenerMiSolicitudActiva // <-- Importamos la nueva
} from '../controllers/solicitudController.js';

const router = express.Router();

router.post('/', crearSolicitud);
router.get('/', listarSolicitudes);
router.put('/:id', actualizarSolicitud);

// RUTA NUEVA
router.get('/activa/:usuarioId', obtenerMiSolicitudActiva);

export default router;