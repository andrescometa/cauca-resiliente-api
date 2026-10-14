// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será una asignación de rescate
const asignacionSchema = new mongoose.Schema({
  _id: Number,                         
  solicitud_id: Number,                 
  socorrista_id: Number,                
  estado_atencion: String,             
  fecha_asignacion: Date               
}, {
  collection: 'asignacion_rescate',     // Nombre de la colección en Mongo
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Asignacion', asignacionSchema);