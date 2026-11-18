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
  // select: false evita que el hash se filtre en cualquier consulta normal
  // (ej. GET /api/usuarios/todos). Para autenticar se usa .select('+password').
  password: { type: String, required: true, select: false },
  telefono: String,
  ciudad: String,
  direccion: String,
  fecha_registro: { type: Date, default: Date.now },
  rol_id: { type: Number, default: 1 },
  rol: String,
  tipo_sangre: String,
  // Foto de perfil almacenada como data URL (base64) para poder mostrarla
  // en la app sin depender de un servidor de archivos.
  foto: String,
  alergias: [String],
  discapacidades: [String],
  contacto_emergencia: {
    nombre: { type: String },
    telefono: { type: String },
    parentesco: { type: String }
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
