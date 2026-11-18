import mongoose from 'mongoose';

// Alertas emitidas por el sistema de control.
const alertsSchema = new mongoose.Schema({
  _id: Number,
  tipo_alerta: String,
  mensaje: String,
  // Noticia | Alerta | Recomendación
  categoria: String,
  nivel_severidad: String,
  zona_afectada: mongoose.Schema.Types.Mixed,
  radio_metros: Number,
  usuarios_notificados: [Number],
  emitida_por: { type: Number, default: null },
  // Fuente oficial y enlace de respaldo (SGC, IDEAM, UNGRD, etc.).
  fuente: String,
  url_oficial: String,
  activa: { type: Boolean, default: true },
  fecha_emision: Date,
  fecha_expiracion: Date,
  fecha_actualizacion: Date,
   externalId: { type: String, index: true },
  rawData: { type: mongoose.Schema.Types.Mixed },
  relevancia: {
  type: String,
  enum: ['dentro', 'cerca', 'lejos'],
  default: 'lejos'
  },
}, {
  collection: 'alertas',
  versionKey: false
});

// En alerts.js, al final


alertsSchema.index(
  { fecha_emision: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { relevancia: 'lejos' } }
);


alertsSchema.index({ fuente: 1, externalId: 1 }, { unique: true, sparse: true });
export default mongoose.model('Alerts', alertsSchema);
