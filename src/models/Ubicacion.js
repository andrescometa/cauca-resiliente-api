// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será una ubicación GPS
const ubicacionSchema = new mongoose.Schema({
  _id: Number,                        
  usuario_id: Number,                 
  latitud: Number,                    
  longitud: Number,                   
  direccion_aproximada: String,     
  precision_metros: Number,           
  bateria: Number,                    
  fecha_hora: Date                    
}, {
  collection: 'historial_ubicaciones',  // Nombre de la colección en Mongo
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Ubicacion', ubicacionSchema);