import mongoose from 'mongoose';

// Definimos cómo será una zona de riesgo
const zonaRiesgoSchema = new mongoose.Schema({
  _id: Number,                          
  nombre_zona: String,                 
  tipo: String,                         
  nivel_peligro: String,                
  descripcion: String,                 
  latitud: Number,                   
  longitud: Number,                    
  radio_metros: Number,                
  fecha_registro: Date                 
}, {
  collection: 'zonas_riesgo',           // Nombre de la colección
  versionKey: false
});

// Exportamos el modelo
export default mongoose.model('ZonaRiesgo', zonaRiesgoSchema);