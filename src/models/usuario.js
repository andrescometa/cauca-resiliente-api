import mongoose from 'mongoose';

// Ubicación GeoJSON opcional. Se define como subesquema para evitar que
// Mongoose cree un Point vacío (coordinates: []) y rompa el índice 2dsphere.
const ubicacionActualSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number]
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  _id: Number,
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  tipo_documento: String,
  identificacion: { type: String, required: true },
  genero: String,
  edad: Number,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: String,
  ciudad: String,
  direccion: String,
  fecha_registro: { type: Date, default: Date.now },
  rol_id: { type: Number, default: 1 },
  rol: String,
  tipo_sangre: String,
  alergias: [String],
  discapacidades: [String],
  contacto_emergencia: {
    nombre: String,
    telefono: String,
    parentesco: String
  },
  contacto_principal: {
    nombre: String,
    telefono: String,
    parentesco: String
  },
  estado_operativo: { type: String, default: 'Disponible' },
  ubicacion_actual: {
    type: ubicacionActualSchema,
    default: undefined
  },
  activo: { type: Boolean, default: true }
}, {
  collection: 'usuarios',
  versionKey: false
});

export default mongoose.model('Usuario', usuarioSchema);
