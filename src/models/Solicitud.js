import mongoose from 'mongoose';

// Definimos cómo será una solicitud de ayuda
const solicitudSchema = new mongoose.Schema({
  _id: Number,                              
  usuario_id: Number,                      
  tipo_ayuda: String,                      
  descripcion_emergencia: String,          
  nivel_prioridad: String,                   
  estado_solicitud: String,                 
  latitud: Number,                          
  longitud: Number,                        
  personas_afectadas: Number,               
  requiere_ambulancia: Boolean,             
  fecha_hora: Date                        
}, {
  collection: 'solicitudes_ayuda',          // Nombre de la colección
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Solicitud', solicitudSchema);