// Importamos mongoose
import mongoose from 'mongoose';

// Ubicación GeoJSON opcional. Se define como subesquema para evitar que
// Mongoose cree un Point vacío (coordinates: []) y rompa el índice 2dsphere.
const ubicacionActualSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number]
}, { _id: false });

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
    type: ubicacionActualSchema,
    default: undefined
  },
  activo: { type: Boolean, default: true }
}, {
  collection: 'usuarios',                   // Nombre de la colección en Mongo
  versionKey: false                         // Quitamos el "__v"
});

// Exportamos el modelo
export default mongoose.model('Usuario', usuarioSchema);