// ===== ARCHIVO: models/usuario.js =====
import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  _id: { type: Number },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  tipo_documento: { type: String }, // Ya no es required a nivel de Mongoose
  identificacion: { type: String, required: true },
  genero: { type: String },
  edad: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, required: true },
  
  // AQUÍ ESTABA EL ERROR: Mongoose los rechazaba
  departamento_id: { type: Number, ref: 'Departamento' }, 
  municipio_id: { type: Number, ref: 'Municipio' }, 
  direccion: { type: String },
  
  fecha_registro: { type: Date, default: Date.now },
  rol: String,                              
  rol_id: { type: Number, default: 1 },
  tipo_sangre: { type: String },                      
  alergias: { type: [String], default: ['Ninguna'] },
  discapacidades: { type: [String], default: ['Ninguna'] },
  contacto_emergencia: {
    nombre: { type: String },
    telefono: { type: String },
    parentesco: { type: String }
  },
  estado_operativo: { type: String, default: 'Disponible' },
  ubicacion_actual: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  activo: { type: Boolean, default: true }
}, {
  collection: 'usuarios',                   
  versionKey: false                         
});

export default mongoose.model('Usuario', usuarioSchema);