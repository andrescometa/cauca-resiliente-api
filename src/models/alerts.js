// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será una asignación de rescate
const alertsSchema = new mongoose.Schema({
  _id: Number,
  tipo_alerta : String,
  mensaje : String,
  nivel_severidad : String,
  zona_afectada : {},
  radio_metros : Number,
  usuario_notificados : {},
  emitida_por: {},
  activa : Boolean,
  fecha_emision : {},
  fecha_expiracion : {}                         
              
}, {
  collection: 'alertas',     // Nombre de la colección en Mongo
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Alerts', alertsSchema);