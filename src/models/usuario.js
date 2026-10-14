// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será un usuario
const usuarioSchema = new mongoose.Schema({
  _id: Number,                              
  nombres: String,
  apellidos: String,
  tipo_documento: String,                   
  identificacion: String,
  genero: String, 
  edad: Number, 
  email: String,
  telefono: String,
  ciudad: String,
  direccion: String,
  fecha_registro: Date,
  rol: String,                              
  tipo_sangre: String,                      
  alergias: [String],
  discapacidades: [String],
  contacto_emergencia: {
    nombre: String,
    telefono: String,
    parentesco: String
  },
  activo: { type: Boolean, default: true }
}, {
  collection: 'usuarios',                   // Nombre de la colección en Mongo
  versionKey: false                         // Quitamos el "__v"
});

// Exportamos el modelo
export default mongoose.model('Usuario', usuarioSchema);