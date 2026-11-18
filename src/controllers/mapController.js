import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js';
import ContactoEmergencia from '../models/ContactoEmergencia.js';
import Alerta from '../models/alerts.js';
import ZonaRiesgo from '../models/ZonaRiesgo.js'; 
import { esSocorrista } from '../config/roles.js';
import JWT_SECRET from '../config/env.js';

const SECRET = JWT_SECRET;

const usuarioDesdeToken = async (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token || token === auth) return null;
  try {
    const decoded = jwt.verify(token, SECRET);
    return await Usuario.findById(Number(decoded.id));
  } catch {
    return null;
  }
};

const CAMPOS_MAPA = { nombres: 1, apellidos: 1, ubicacion_actual: 1, foto: 1 };

const formatearUsuarios = (usuarios) => usuarios
  .filter((u) => Array.isArray(u.ubicacion_actual?.coordinates) && u.ubicacion_actual.coordinates.length === 2)
  .map((u) => {
    const [longitude, latitude] = u.ubicacion_actual.coordinates;
    return {
      id: String(u._id),
      name: [u.nombres, u.apellidos].filter(Boolean).join(' ').trim() || 'Usuario',
      latitude,
      longitude,
      type: 'usuario',
      intensity: 1,
      photo: u.foto ?? null
    };
  });

const formatearAlertas = (alertas) => alertas
  .filter((a) => Array.isArray(a.zona_afectada?.coordinates) && a.zona_afectada.coordinates.length === 2)
  .map((a) => {
    const [longitude, latitude] = a.zona_afectada.coordinates;
    return {
      id: String(a._id),
      name: a.tipo_alerta || 'Alerta',
      latitude,
      longitude,
      type: 'alerta',
      intensity: a.nivel_severidad === 'Crítica' ? 3 : a.nivel_severidad === 'Urgente' ? 2 : 1,
      category: a.categoria || 'Alerta',
      severity: a.nivel_severidad || 'Informativa',
      source: a.fuente || '',
      message: a.mensaje || '',
      radius: a.radio_metros ?? null,
      relevance: a.relevancia || 'lejos',
      url: a.url_oficial || null
    };
  });

const formatearZonas = (zonas) => zonas
  .filter((z) => Array.isArray(z.coordenadas_centro?.coordinates) && z.coordenadas_centro.coordinates.length === 2)
  .map((z) => {
    const [longitude, latitude] = z.coordenadas_centro.coordinates;
    return {
      id: String(z._id),
      name: z.nombre_zona || 'Zona de riesgo',
      latitude,
      longitude,
      type: 'zona',
      intensity: z.nivel_peligro === 'Inminente' ? 3 : z.nivel_peligro === 'Alto' ? 2 : 1,
      riskType: z.tipo_riesgo || '',
      population: z.poblacion_estimada ?? null,
      radius: z.radio_metros ?? null
    };
  });

export const getMapPoints = async (req, res) => {
  try {
    const usuarioActual = await usuarioDesdeToken(req);
    if (!usuarioActual) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    // 1. Alertas activas (todas las fuentes)
    const alertas = await Alerta.find({
      activa: true,
      zona_afectada: { $ne: null }
    }).lean();

    // 2. Zonas de riesgo activas
    const zonas = await ZonaRiesgo.find({ activa: true }).lean();

    // 3. Usuarios (según rol)
    let usuarios = [];
    if (esSocorrista(usuarioActual)) {
      usuarios = await Usuario.find(
        { 'ubicacion_actual.coordinates': { $exists: true, $ne: [] } },
        CAMPOS_MAPA
      ).lean();
    } else {
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

      if (telefonosUnicos.length > 0) {
        usuarios = await Usuario.find(
          {
            _id: { $ne: usuarioActual._id },
            $or: [
              { telefono: { $in: telefonosUnicos } },
              { identificacion: { $in: telefonosUnicos } }
            ],
            'ubicacion_actual.coordinates': { $exists: true, $ne: [] }
          },
          CAMPOS_MAPA
        ).lean();
      }
    }

    const puntos = [
      ...formatearAlertas(alertas),
      ...formatearZonas(zonas),
      ...formatearUsuarios(usuarios)
    ];

    return res.status(200).json(puntos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener puntos del mapa', error: error.message });
  }
};


// src/controllers/mapController.js — agregar endpoint nuevo
export const getAlertasMapa = async (req, res) => {
  try {
    const alertas = await Alerta.find({
      activa: true,
      zona_afectada: { $ne: null }
    }).lean();

    const puntos = alertas
      .filter(a => Array.isArray(a.zona_afectada?.coordinates))
      .map(a => {
        const [lng, lat] = a.zona_afectada.coordinates;
        return {
          id: String(a._id),
          name: a.tipo_alerta || 'Alerta',
          latitude: lat,
          longitude: lng,
          type: 'alerta',
          intensity: a.nivel_severidad === 'Crítica' ? 3 : a.nivel_severidad === 'Urgente' ? 2 : 1,
          photo: null,
          category: a.categoria || 'Alerta',
          severity: a.nivel_severidad || 'Informativa',
          source: a.fuente || '',
          message: a.mensaje || '',
          radius: a.radio_metros ?? null,
          relevance: a.relevancia || 'lejos',
          url: a.url_oficial || null
        };
      });

    res.status(200).json(puntos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener alertas del mapa', error: error.message });
  }
};