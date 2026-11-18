import express from 'express';
import {
  crearZonaRiesgo,
  consultarZonasCercanas,
  listarZonasRiesgo,
  obtenerZonaRiesgo,
  actualizarZonaRiesgo,
  eliminarZonaRiesgo
} from '../controllers/zonaRiesgoController.js';
import { requiereAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Público: la app consulta las zonas activas.
router.get('/', listarZonasRiesgo);
router.get('/cercanas', consultarZonasCercanas);
router.get('/:id', obtenerZonaRiesgo);

// Solo administradores pueden crear, editar o desactivar zonas.
router.post('/', requiereAdmin, crearZonaRiesgo);
router.put('/:id', requiereAdmin, actualizarZonaRiesgo);
router.delete('/:id', requiereAdmin, eliminarZonaRiesgo);

export default router;
