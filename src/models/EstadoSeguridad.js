// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será un estado de seguridad
const estadoSchema = new mongoose.Schema({
  _id: Number,
  usuario_id: Number,
  estado: String,                                // "A salvo", "En riesgo", "Atrapado", "Desaparecido"
  mensaje_estado: String,
  fecha_ultima_actualizacion: Date
}, {
  collection: 'estados_seguridad',
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('EstadoSeguridad', estadoSchema);