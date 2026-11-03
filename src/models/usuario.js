// Importamos mongoose
import mongoose from 'mongoose';

// Definimos cómo será un usuario
const usuarioSchema = new mongoose.Schema({
  nombres: String,
  apellidos: String,
  tipo_documento: String,                   
  identificacion: String,
  genero: String, 
  edad: Number, 
  email: String,
  password: String,
  telefono: String,
  ciudad: String,
  direccion: String,
  fecha_registro: Date,
  rol: String,                              
  rol_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rol' },
  tipo_sangre: String,                      
  alergias: [String],
  discapacidades: [String],
  contacto_emergencia: {
    nombre: String,
    telefono: String,
    parentesco: String
  },
  ubicacion_actual: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  activo: { type: Boolean, default: true }
}, {
  collection: 'usuarios',                   // Nombre de la colección en Mongo
  versionKey: false                         // Quitamos el "__v"
});

// Exportamos el modelo
export default mongoose.model('Usuario', usuarioSchema);