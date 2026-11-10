import express from 'express';

// Importamos las funciones del controlador (agregamos listarZonasRiesgo)
import { 
  crearZonaRiesgo, 
  consultarZonasCercanas, 
  listarZonasRiesgo 
} from '../controllers/zonaRiesgoController.js';

const router = express.Router();

// POST /api/zonas-riesgo → crear
router.post('/', crearZonaRiesgo);

// GET /api/zonas-riesgo → listar todas (¡ESTA ERA LA QUE FALTABA!)
router.get('/', listarZonasRiesgo);

// GET /api/zonas-riesgo/cercanas → consultar cercanas
router.get('/cercanas', consultarZonasCercanas);

export default router;