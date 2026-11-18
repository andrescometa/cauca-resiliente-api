import mongoose from 'mongoose';

// Contador atómico por colección. Evita IDs duplicados cuando hay peticiones
// simultáneas o cuando se eliminan documentos (countDocuments + 1 fallaba).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}, {
  collection: 'counters',
  versionKey: false
});

export default mongoose.models.Counter || mongoose.model('Counter', counterSchema);
