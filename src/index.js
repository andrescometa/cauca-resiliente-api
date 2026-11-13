import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Configuración de CORS para permitir que Netlify se conecte
app.use(cors());
app.use(express.json());

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

conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
