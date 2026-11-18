import express from 'express';
import { 
  crearSolicitud, 
  listarSolicitudes,
  listarSolicitudesPendientes,
  actualizarEstadoSolicitud 
} from '../controllers/solicitudController.js';

const router = express.Router();

router.post('/', crearSolicitud); 
router.get('/pendientes', listarSolicitudesPendientes);
router.get('/', listarSolicitudes);
router.put('/:id', actualizarEstadoSolicitud); 

export default router;