import mongoose from 'mongoose';

// Alertas emitidas por el sistema de control.
const alertsSchema = new mongoose.Schema({
  _id: Number,
  tipo_alerta: String,
  mensaje: String,
  nivel_severidad: String,
  zona_afectada: mongoose.Schema.Types.Mixed,
  radio_metros: Number,
  usuarios_notificados: [Number],
  emitida_por: { type: Number, default: null },
  activa: Boolean,
  fecha_emision: Date,
  fecha_expiracion: Date
}, {
  collection: 'alertas',
  versionKey: false
});

export default mongoose.model('Alerts', alertsSchema);
