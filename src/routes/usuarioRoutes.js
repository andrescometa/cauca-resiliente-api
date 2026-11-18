import express from 'express';
import { 
  registrarUsuario, 
  loginUsuario, 
  listarUsuarios, 
  ObtenerUsuario,
  actualizarRolUsuario,
  actualizarEstadoOperativo,
  actualizarPerfil,
  actualizarFoto
} from '../controllers/usuarioController.js';
import { requiereAdmin } from '../middleware/adminAuth.js';
import { limitarLogin } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/registro', registrarUsuario); 
router.post('/login', limitarLogin, loginUsuario);         
router.get('/todos', listarUsuarios);        
router.get('/:usuarioId', ObtenerUsuario);
router.put('/:id/rol', requiereAdmin, actualizarRolUsuario); 
router.put('/:id/estado', actualizarEstadoOperativo); // <-- LA RUTA MÁGICA
router.put('/:id/perfil', actualizarPerfil);
router.put('/:id/foto', actualizarFoto);

export default router;
