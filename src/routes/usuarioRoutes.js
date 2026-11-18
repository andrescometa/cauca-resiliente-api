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

const router = express.Router();

router.post('/registro', registrarUsuario); 
router.post('/login', loginUsuario);         
router.get('/todos', listarUsuarios);        
router.get('/:usuarioId', ObtenerUsuario);
router.put('/:id/rol', actualizarRolUsuario); 
router.put('/:id/estado', actualizarEstadoOperativo); // <-- LA RUTA MÁGICA
router.put('/:id/perfil', actualizarPerfil);
router.put('/:id/foto', actualizarFoto);

export default router;
