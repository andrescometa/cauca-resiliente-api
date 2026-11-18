import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import estadoRoutes from './routes/estadoRoutes.js';
import ubicacionRoutes from './routes/ubicacionRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js';
import asignacionRoutes from './routes/asignacionRoutes.js';
import zonaRiesgoRoutes from './routes/zonaRiesgoRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import contactoRoutes from './routes/contactoRoutes.js';
import deviceTokenRoutes from './routes/deviceTokenRoutes.js';
import { iniciarUsgsWorker } from './workers/UsgsWorker.js';
import { iniciarDefensoriaWorker } from './workers/defensoria.worker.js';
import { iniciarIdeamWorker } from './workers/ideam-worker.js';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Railway (y otros proxys) envían la IP real en X-Forwarded-For; sin esto el
// limitador de login vería a todos los clientes con la misma IP.
app.set('trust proxy', 1);

// Configuración de CORS para permitir que Netlify se conecte
app.use(cors());
app.use(express.json({ limit: '4mb' }));

// Panel web de administración (alertas y zonas de riesgo).
app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Cauca Resiliente funcionando en la nube' });
});

// todas las peticiones que hagamos son manejadas por el controlador de rutas correspondiente
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estados', estadoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/solicitud', solicitudRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/zonas-riesgo', zonaRiesgoRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/contactos', contactoRoutes);
app.use('/api/devices', deviceTokenRoutes);


// 404 en JSON (antes Express devolvía HTML).
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejador global de errores: evita respuestas HTML y dobles respuestas.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('Error no controlado:', error);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const iniciar = async () => {
  // Esperamos la conexión antes de aceptar peticiones: así el healthcheck de
  // Railway no reporta "saludable" mientras MongoDB todavía no responde.
  await conectarDB();

  iniciarUsgsWorker(); // Iniciar el worker de sismos
  iniciarDefensoriaWorker();
  iniciarIdeamWorker();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

iniciar();
