// Importamos mongoose para conectarnos a MongoDB
import mongoose from 'mongoose';

// Función que conecta a la base de datos
const conectarDB = async () => {
  try {
    // Leemos la URI de sde el archivo .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1); // Cierra el proceso si falla
  }
};

// Exportamos la función para usarla en index.js
export default conectarDB;