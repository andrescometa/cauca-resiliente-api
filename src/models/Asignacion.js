import mongoose from 'mongoose';

// Asignación de una solicitud a un socorrista.
// Los documentos existentes usan socorrista_usuario_id; se conserva
// socorrista_id como alias para compatibilidad con datos anteriores.
const asignacionSchema = new mongoose.Schema({
  solicitud_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Solicitud' },
  organismo_id: { type: mongoose.Schema.Types.ObjectId },
  socorrista_usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  socorrista_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado_atencion: String,
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
