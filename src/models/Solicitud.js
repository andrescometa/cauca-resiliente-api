import mongoose from 'mongoose';

const solicitudSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: { type: Number, required: true },
  tipo_ayuda: { type: String, required: true },
  descripcion_emergencia: String,
  nivel_prioridad: { type: String, required: true },
  estado_solicitud: { type: String, default: 'Pendiente' },
  latitud: Number,
  longitud: Number,
  personas_afectadas: Number,
  requiere_ambulancia: Boolean,
  socorrista_id: { type: Number, default: null }, // <-- NUEVO CAMPO
  fecha_hora: { type: Date, default: Date.now }
}, {
  collection: 'solicitudes_ayuda',
  versionKey: false
});

export default mongoose.model('Solicitud', solicitudSchema);