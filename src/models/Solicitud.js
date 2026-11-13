import mongoose from 'mongoose';

const puntoSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number]
}, { _id: false });

const solicitudSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: { type: Number, required: true },
  tipo_ayuda: { type: String, required: true },
  descripcion_emergencia: String,
  nivel_prioridad: { type: String, required: true },
  estado_solicitud: { type: String, default: 'Pendiente' },
  latitud: Number,
  longitud: Number,
  ubicacion_solicitud: { type: puntoSchema, default: undefined },
  imagenes_adjuntas: [String],
  personas_afectadas: Number,
  requiere_ambulancia: Boolean,
  socorrista_id: { type: Number, default: null },
  asignacion: mongoose.Schema.Types.Mixed,
  fecha_hora: { type: Date, default: Date.now },
  fecha_cierre: Date
}, {
  collection: 'solicitudes_ayuda',
  versionKey: false
});

export default mongoose.model('Solicitud', solicitudSchema);
