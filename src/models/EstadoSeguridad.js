// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será un estado de seguridad
const estadoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: String,                                // "A salvo", "En riesgo", "Atrapado", "Desaparecido"
  mensaje_estado: String,
  fecha_ultima_actualizacion: Date
}, {
  collection: 'estados_seguridad',
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('EstadoSeguridad', estadoSchema);