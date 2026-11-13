import mongoose from 'mongoose';

// Contactos de emergencia registrados por un usuario.
const contactoEmergenciaSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: { type: Number, required: true },
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
