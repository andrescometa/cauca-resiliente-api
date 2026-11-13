import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js';
import ContactoEmergencia from '../models/ContactoEmergencia.js';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';
const ROL_SOCORRISTA_ID = '650000000000000000000002';

const esSocorrista = (usuario) => {
  const rol = String(usuario?.rol || '').trim().toLowerCase();
  if (rol === 'socorrista') return true;
  return String(usuario?.rol_id || '') === ROL_SOCORRISTA_ID;
};

const usuarioDesdeToken = async (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token || token === auth) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    return await Usuario.findById(decoded.id);
  } catch {
    return null;
  }
};

const CAMPOS_MAPA = { nombres: 1, apellidos: 1, ubicacion_actual: 1 };

const formatearPuntos = (usuarios) => usuarios
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

export const getMapPoints = async (req, res) => {
  try {
    const usuarioActual = await usuarioDesdeToken(req);
    if (!usuarioActual) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    if (esSocorrista(usuarioActual)) {
      // El socorrista puede ver a todos los usuarios con ubicación.
      const usuarios = await Usuario.find(
        { 'ubicacion_actual.coordinates': { $exists: true, $ne: [] } },
        CAMPOS_MAPA
      );
      return res.status(200).json(formatearPuntos(usuarios));
    }

    // El usuario común solo ve la ubicación de sus contactos de emergencia.
    const contactos = await ContactoEmergencia.find(
      { usuario_id: usuarioActual._id },
      { telefono_contacto: 1 }
    );

    const telefonos = contactos
      .map((c) => String(c.telefono_contacto || '').trim())
      .filter(Boolean);

    const telefonoPrincipal = String(usuarioActual.contacto_emergencia?.telefono || '').trim();
    if (telefonoPrincipal) telefonos.push(telefonoPrincipal);

    const telefonosUnicos = [...new Set(telefonos)];
    if (telefonosUnicos.length === 0) {
      return res.status(200).json([]);
    }

    const usuarios = await Usuario.find(
      {
        _id: { $ne: usuarioActual._id },
        $or: [
          { telefono: { $in: telefonosUnicos } },
          { identificacion: { $in: telefonosUnicos } }
        ],
        'ubicacion_actual.coordinates': { $exists: true, $ne: [] }
      },
      CAMPOS_MAPA
    );

    return res.status(200).json(formatearPuntos(usuarios));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener puntos del mapa', error: error.message });
  }
};
