// Importamos express
import express from 'express';

// Importamos las funciones del controlador
import {  listarAlertas } from '../controllers/alertsController.js';

// Creamos el router
const router = express.Router();

// GET /api/alerts → listar
router.get('/', listarAlertas);


// GET /api/alert → listar
// router.get('/:Id', ObtenerAlerta);


// Exportamos
export default router;