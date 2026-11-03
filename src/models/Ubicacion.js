// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será una ubicación GPS
const ubicacionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  direccion_aproximada: String,
  precision_metros: Number,
  bateria: Number,
  fecha_hora: { type: Date, default: Date.now }
}, {
  collection: 'historial_ubicaciones',  // Nombre de la colección en Mongo
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Ubicacion', ubicacionSchema);