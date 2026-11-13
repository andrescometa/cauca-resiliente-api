import mongoose from 'mongoose';

// Asignación de una solicitud a un socorrista.
// Los documentos existentes usan socorrista_usuario_id; se conserva
// socorrista_id como alias para compatibilidad con datos anteriores.
const asignacionSchema = new mongoose.Schema({
  _id: Number,
  solicitud_id: { type: Number, required: true },
  organismo_id: { type: Number, default: null },
  socorrista_usuario_id: { type: Number, required: true },
  socorrista_id: { type: Number, default: null },
  estado_atencion: String,
  fecha_asignacion: Date,
  fecha_hora_asignacion: Date,
  fecha_hora_llegada: Date,
  fecha_hora_cierre: Date,
  observaciones: String,
  recursos_utilizados: [String]
}, {
  collection: 'asignacion_rescate',
  versionKey: false
});

export default mongoose.model('Asignacion', asignacionSchema);
