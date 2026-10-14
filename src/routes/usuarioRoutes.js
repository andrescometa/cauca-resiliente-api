// Importamos express
import express from 'express';

// Importamos las funciones del controlador
import { crearUsuario, listarUsuarios } from '../controllers/usuarioController.js';

// Creamos el router
const router = express.Router();

// POST /api/usuarios → crear
router.post('/', crearUsuario);

// GET /api/usuarios → listar
router.get('/', listarUsuarios);

// Exportamos
export default router;