import DeviceToken from '../models/DeviceToken.js';

export const guardarToken = async (req, res) => {
  try {
    const { token, topics } = req.body;
    if (!token) return res.status(400).json({ mensaje: 'token es obligatorio' });

    // upsert: si el token existe, actualiza topics y timestamp
    await DeviceToken.findOneAndUpdate(
  { token },
  { token, topics: topics || [], updatedAt: new Date() },
  { upsert: true, returnDocument: 'after' }
);

    res.status(200).json({ mensaje: 'Token registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar token', error: error.message });
  }
};