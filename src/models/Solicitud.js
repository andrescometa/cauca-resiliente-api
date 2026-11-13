// ===== ARCHIVO: models/Solicitud.js =====
import mongoose from 'mongoose';

const solicitudSchema = new mongoose.Schema({
  // IMPORTANTE: Obligamos a que el ID sea un Número
  _id: { type: Number },
  usuario_id: { type: Number, required: true }, 
  tipo_ayuda: { type: String, required: true },                      
  descripcion_emergencia: String,          
  nivel_prioridad: { type: String, required: true },                   
  estado_solicitud: { type: String, default: 'Pendiente' }, 
  latitud: { type: Number, min: -90, max: 90 },
  longitud: { type: Number, min: -180, max: 180 },
  personas_afectadas: { type: Number, default: 1 },               
  requiere_ambulancia: { type: Boolean, default: false },   
  socorrista_id: { type: Number, default: null }, 
  fecha_hora: { type: Date, default: Date.now }                        
}, {
  collection: 'solicitudes_ayuda',
  versionKey: false
});

export default mongoose.model('Solicitud', solicitudSchema);