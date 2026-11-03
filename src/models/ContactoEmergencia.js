import mongoose from 'mongoose';

const contactoEmergenciaSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre_contacto: String,
  telefono_contacto: String,
  parentesco: String,
  prioridad: Number,
  notificado: { type: Boolean, default: false }
}, {
  collection: 'contactos_emergencia',
  versionKey: false
});

export default mongoose.model('ContactoEmergencia', contactoEmergenciaSchema);
