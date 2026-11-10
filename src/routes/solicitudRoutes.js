import express from 'express';
import { 
  crearSolicitud, 
  listarSolicitudes, // <-- AQUÍ ESTABA EL ERROR: se llama listarSolicitudes
  actualizarEstadoSolicitud 
} from '../controllers/solicitudController.js';

const router = express.Router();

router.post('/', crearSolicitud); 
router.get('/', listarSolicitudes); // <-- Y aquí también
router.put('/:id', actualizarEstadoSolicitud); 

export default router;