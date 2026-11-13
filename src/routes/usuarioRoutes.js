import express from 'express';
import { 
  registrarUsuario, 
  loginUsuario, 
  listarUsuarios, 
  ObtenerUsuario,
  actualizarRolUsuario,
  actualizarEstadoOperativo
} from '../controllers/usuarioController.js';

const router = express.Router();

// 1. PRIMERO van las rutas específicas (login, registro, etc.)
router.post('/registro', registrarUsuario); 
router.post('/login', loginUsuario);         
router.get('/todos', listarUsuarios);        

// 2. DESPUÉS van las rutas de actualización
router.put('/:id/rol', actualizarRolUsuario); 
router.put('/:id/estado', actualizarEstadoOperativo); 

// 3. AL FINAL va la ruta dinámica (la que usa el ID)
router.get('/:usuarioId', ObtenerUsuario);

export default router;