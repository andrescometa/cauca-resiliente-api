import mongoose from 'mongoose';

const puntoSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true } // [longitud, latitud]
}, { _id: false });

const zonaRiesgoSchema = new mongoose.Schema({
  _id: Number,
  nombre_zona: String,
  tipo: String,
  tipo_riesgo: String,
  nivel_peligro: String,
  descripcion: String,
  latitud: Number,
  longitud: Number,
  coordenadas_centro: { type: puntoSchema, default: undefined },
  radio_metros: Number,
  area_afectada: mongoose.Schema.Types.Mixed,
  estado_zona: String,
  modelo_3d_url: String,
  imagenes_satelitales: [String],
  poblacion_estimada: Number,
  activa: { type: Boolean, default: true },
  fecha_registro: Date,
  fecha_deteccion: Date,
  fecha_actualizacion: Date
}, {
  collection: 'zonas_riesgo',
  versionKey: false
});

zonaRiesgoSchema.index({ coordenadas_centro: '2dsphere' });

export default mongoose.model('ZonaRiesgo', zonaRiesgoSchema);
