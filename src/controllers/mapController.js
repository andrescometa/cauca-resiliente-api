import Usuario from '../models/usuario.js';

export const getMapPoints = async (req, res) => {
  try {
    const usuarios = await Usuario.find(
      { 'ubicacion_actual.coordinates': { $exists: true, $ne: [] } },
      { nombres: 1, apellidos: 1, ubicacion_actual: 1 }
    );

    const puntos = usuarios
      .filter((u) => Array.isArray(u.ubicacion_actual?.coordinates) && u.ubicacion_actual.coordinates.length === 2)
      .map((u) => {
        const [longitude, latitude] = u.ubicacion_actual.coordinates;
        return {
          id: String(u._id),
          name: [u.nombres, u.apellidos].filter(Boolean).join(' ').trim() || 'Usuario',
          latitude,
          longitude,
          type: 'usuario',
          intensity: 1
        };
      });

    res.status(200).json(puntos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener puntos del mapa', error: error.message });
  }
};
