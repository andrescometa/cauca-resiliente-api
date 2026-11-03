import express from 'express';
import { getContactosPorUsuario } from '../controllers/contactoController.js';

const router = express.Router();

// GET /api/contactos/:usuarioId -> contactos de emergencia del usuario
router.get('/:usuarioId', getContactosPorUsuario);

export default router;
