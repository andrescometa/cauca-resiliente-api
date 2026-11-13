import mongoose from 'mongoose';

// Estado de seguridad (A salvo, En riesgo, Atrapado, Desaparecido).
const estadoSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: { type: Number, required: true },
  estado: String,
  mensaje_estado: String,
  es_automatico: { type: Boolean, default: false },
  fecha_ultima_actualizacion: Date
}, {
  collection: 'estados_seguridad',
  versionKey: false
});

export default mongoose.model('EstadoSeguridad', estadoSchema);
