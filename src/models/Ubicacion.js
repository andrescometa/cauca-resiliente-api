import mongoose from 'mongoose';

// Ubicación GPS registrada por el usuario.
const ubicacionSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: { type: Number, required: true },
  latitud: Number,
  longitud: Number,
  coordenadas: mongoose.Schema.Types.Mixed,
  direccion_aproximada: String,
  precision_metros: Number,
  bateria: Number,
  bateria_dispositivo: Number,
  fecha_hora: { type: Date, default: Date.now }
}, {
  collection: 'historial_ubicaciones',
  versionKey: false
});

export default mongoose.model('Ubicacion', ubicacionSchema);
