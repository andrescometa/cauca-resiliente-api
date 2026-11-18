import express from 'express';
import {
  getContactosPorUsuario,
  crearContacto,
  actualizarContacto,
  eliminarContacto
} from '../controllers/contactoController.js';

const router = express.Router();

// GET /api/contactos/:usuarioId -> contactos de emergencia del usuario
router.get('/:usuarioId', getContactosPorUsuario);

// POST /api/contactos -> vincular un contacto de emergencia
router.post('/', crearContacto);

// PUT /api/contactos/:id -> actualizar un contacto
router.put('/:id', actualizarContacto);

// DELETE /api/contactos/:id?usuario_id=... -> eliminar un contacto
router.delete('/:id', eliminarContacto);

export default router;
