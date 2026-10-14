import express from 'express';           // Framework del servidor
import cors from 'cors';                 // Permite conexiones externas
import dotenv from 'dotenv';             // Lee el archivo .env
import conectarDB from './config/db.js'; // Nuestra función de conexión
import usuarioRoutes from './routes/usuarioRoutes.js'; //Importamos los el archivo de rutas de usuario
import estadoRoutes from './routes/estadoRoutes.js'; //importamos el archivo de rutas de estado
import ubicacionRoutes from './routes/ubicacionRoutes.js'; //importamos el archivo de rutas de ubicacion
import solicitudRoutes from './routes/solicitudRoutes.js'; //importamos el archivo de rutas de solicitud
import asignacionRoutes from './routes/asignacionRoutes.js'; //importamos el archivo de rutas de asignacion
import zonaRiesgoRoutes from './routes/zonaRiesgoRoutes.js'; //importamos el archivo de  de zona de riesgo


dotenv.config();                         // Carga las variables del .env
const app = express();                   // Creamos la app de express
const PORT = process.env.PORT || 3000;   // Puerto del .env o 3000


app.use(cors());                         // Permite peticiones desde la app Android
app.use(express.json());                 // Permite recibir JSON en el body



app.get('/', (req, res) => {
  res.json({ mensaje: 'API Cauca Resiliente funcionando ✅' });
});
//todas la peticiones que hagamos son manejadas por el controlador de rutas correspondiente
app.use('/api/usuarios', usuarioRoutes); //
app.use('/api/estados', estadoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/zonas-riesgo', zonaRiesgoRoutes);
conectarDB();                            // Nos conectamos a MongoDB

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});