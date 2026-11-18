import mongoose from 'mongoose';

const conectarDB = async () => {
  const uri = process.env.MONGO_URI;

  // Mensaje claro si falta la variable (en Railway se configura en Variables).
  if (!uri) {
    console.error('❌ MONGO_URI no está definida. Agrégala en las variables de entorno del servicio.');
    process.exit(1);
  }

  try {
    // 15 s es suficiente para Atlas; si la IP no está permitida falla rápido y
    // Railway puede reintentar en vez de quedarse colgado.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

export default conectarDB;
