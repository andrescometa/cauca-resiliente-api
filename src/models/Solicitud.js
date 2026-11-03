import mongoose from 'mongoose';

// Definimos cómo será una solicitud de ayuda
const solicitudSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  tipo_ayuda: String,                      
  descripcion_emergencia: String,          
  nivel_prioridad: String,                   
  estado_solicitud: String,                 
  latitud: { type: Number, min: -90, max: 90 },
  longitud: { type: Number, min: -180, max: 180 },
  personas_afectadas: Number,               
  requiere_ambulancia: Boolean,             
  fecha_hora: Date                        
}, {
  collection: 'solicitudes_ayuda',          // Nombre de la colección
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('Solicitud', solicitudSchema);