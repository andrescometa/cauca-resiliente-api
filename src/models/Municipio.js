import mongoose from 'mongoose';

const municipioSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true },
  departamento_id: { type: Number, ref: 'Departamento', required: true }
}, {
  collection: 'municipios',
  versionKey: false
});

export default mongoose.model('Municipio', municipioSchema);