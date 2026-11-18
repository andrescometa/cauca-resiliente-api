import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: Number, default: null }, // opcional, si el usuario inició sesión
  topics: [{ type: String }], // topics suscritos: alertas_cauca, alertas_sismo, etc.
  platform: { type: String, default: 'android' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeviceToken', deviceTokenSchema);