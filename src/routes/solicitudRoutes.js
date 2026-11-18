import express from 'express';
import {
  crearSolicitud,
  listarSolicitudes,
  listarSolicitudesPendientes,
  actualizarEstadoSolicitud,
  obtenerMiSolicitudActiva
} from '../controllers/solicitudController.js';

const router = express.Router();

router.post('/', crearSolicitud);
router.get('/pendientes', listarSolicitudesPendientes);
router.get('/activa/:usuarioId', obtenerMiSolicitudActiva);
router.get('/', listarSolicitudes);
router.put('/:id', actualizarEstadoSolicitud);

export default router;
