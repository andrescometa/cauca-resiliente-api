import mongoose from 'mongoose';

const departamentoSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true }
}, {
  collection: 'departamentos',
  versionKey: false
});

export default mongoose.model('Departamento', departamentoSchema);