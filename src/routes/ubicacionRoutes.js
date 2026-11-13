import express from 'express';
import { 
  crearUbicacion, 
  consultarHistorial,
  listarDepartamentos,
  listarMunicipiosPorDepartamento
} from '../controllers/ubicacionController.js';

const router = express.Router();

// 1. PRIMERO las rutas específicas (Departamentos y Municipios)
router.get('/departamentos', listarDepartamentos);
router.get('/municipios/:departamentoId', listarMunicipiosPorDepartamento);

// 2. DESPUÉS las rutas dinámicas (con :usuarioId)
router.post('/', crearUbicacion);
router.get('/:usuarioId', consultarHistorial);

export default router;