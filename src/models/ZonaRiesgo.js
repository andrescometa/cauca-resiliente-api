import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true } // [longitud, latitud]
}, { _id: false });

const zonaRiesgoSchema = new mongoose.Schema({
  nombre_zona: { type: String, required: true },
  tipo_riesgo: String,
  nivel_peligro: String,
  descripcion: String,
  coordenadas_centro: pointSchema,
  radio_metros: Number,
  area_afectada: mongoose.Schema.Types.Mixed,
  estado_zona: String,
  modelo_3d_url: String,
  imagenes_satelitales: [String],
  poblacion_estimada: Number,
  activa: { type: Boolean, default: true },
  fecha_deteccion: Date,
  fecha_actualizacion: Date
}, {
  collection: 'zonas_riesgo',
  versionKey: false
});

export default mongoose.model('ZonaRiesgo', zonaRiesgoSchema);
