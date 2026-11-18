import express from 'express';
import {
  listarAlertas,
  obtenerAlerta,
  crearAlerta,
  actualizarAlerta,
  eliminarAlerta
} from '../controllers/alertsController.js';
import { requiereAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Público: la app consulta las alertas activas.
router.get('/', listarAlertas);
router.get('/:id', obtenerAlerta);

// Solo administradores pueden crear, editar o desactivar alertas.
router.post('/', requiereAdmin, crearAlerta);
router.put('/:id', requiereAdmin, actualizarAlerta);
router.delete('/:id', requiereAdmin, eliminarAlerta);

export default router;
