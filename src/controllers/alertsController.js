import Alerta from '../models/alerts.js';
import { enviarPushPorTopic } from '../services/fcmService.js';

const CATEGORIAS = ['Noticia', 'Alerta', 'Recomendación'];
const SEVERIDADES = [
  'Informativa',
  'Preventiva',
  'Urgente',
  'Crítica',
  'Baja',
  'Media',
  'Alta'
];

const siguienteId = async () => {
  const ultima = await Alerta.findOne().sort({ _id: -1 }).lean();
  return (ultima?._id ?? 0) + 1;
};

const texto = (valor) => String(valor ?? '').trim();

const fechaValida = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const normalizarCategoria = (valor) => CATEGORIAS.find(
  (categoria) => categoria.toLowerCase() === texto(valor).toLowerCase()
) ?? null;

const categoriaDesdeSeveridad = (severidad) => {
  const valor = texto(severidad).toLowerCase();
  if (['crítica', 'critica', 'urgente'].includes(valor)) return 'Alerta';
  if (valor === 'preventiva') return 'Recomendación';
  return 'Noticia';
};

const normalizarSeveridad = (valor) => SEVERIDADES.find(
  (severidad) => severidad.toLowerCase() === texto(valor).toLowerCase()
) ?? null;

const leerPunto = (body) => {
  const zona = body.zona_afectada;
  if (zona && zona.type === 'Point' && Array.isArray(zona.coordinates) && zona.coordinates.length >= 2) {
    const lng = Number(zona.coordinates[0]);
    const lat = Number(zona.coordinates[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { error: 'Coordenadas de la zona inválidas' };
    }
    return { punto: { type: 'Point', coordinates: [lng, lat] } };
  }

  if (body.latitud !== undefined || body.longitud !== undefined) {
    const lat = Number(body.latitud);
    const lng = Number(body.longitud);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { error: 'latitud y longitud deben ser números válidos' };
    }
    return { punto: { type: 'Point', coordinates: [lng, lat] } };
  }

  return {};
};

// ============ LISTAR ============
// GET /api/alerts
// Parámetros opcionales:
//   todas=1          incluye inactivas y expiradas
//   categoria=Alerta
//   desde=2026-01-01T00:00:00Z
export const listarAlertas = async (req, res) => {
  try {
    const incluirTodas = ['1', 'true', 'si'].includes(texto(req.query.todas).toLowerCase());
    const filtro = {};

    if (!incluirTodas) {
      filtro.activa = { $ne: false };
      filtro.$or = [
        { fecha_expiracion: null },
        { fecha_expiracion: { $exists: false } },
        { fecha_expiracion: { $gt: new Date() } }
      ];
    }

    const categoria = normalizarCategoria(req.query.categoria);
    if (categoria) filtro.categoria = categoria;

    const desde = fechaValida(req.query.desde);
    if (desde) filtro.fecha_actualizacion = { $gte: desde };

    const alertas = await Alerta.find(filtro).sort({ fecha_emision: -1, _id: -1 }).lean();
    res.status(200).json(alertas.map((alerta) => ({
      ...alerta,
      categoria: alerta.categoria || categoriaDesdeSeveridad(alerta.nivel_severidad)
    })));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar alertas', error: error.message });
  }
};

// ============ OBTENER UNA ============
export const obtenerAlerta = async (req, res) => {
  try {
    const alerta = await Alerta.findById(Number(req.params.id)).lean();
    if (!alerta) return res.status(404).json({ mensaje: 'Alerta no encontrada' });
    res.status(200).json({
      ...alerta,
      categoria: alerta.categoria || categoriaDesdeSeveridad(alerta.nivel_severidad)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar la alerta', error: error.message });
  }
};

// ============ CREAR ============
export const crearAlerta = async (req, res) => {
  try {
    const tipoAlerta = texto(req.body.tipo_alerta);
    const mensaje = texto(req.body.mensaje);
    if (!tipoAlerta || !mensaje) {
      return res.status(400).json({ mensaje: 'tipo_alerta y mensaje son obligatorios' });
    }

    const categoria = normalizarCategoria(req.body.categoria)
      ?? categoriaDesdeSeveridad(req.body.nivel_severidad);
    const severidad = normalizarSeveridad(req.body.nivel_severidad) ?? 'Informativa';

    const punto = leerPunto(req.body);
    if (punto.error) return res.status(400).json({ mensaje: punto.error });

    const fechaEmision = req.body.fecha_emision
      ? fechaValida(req.body.fecha_emision)
      : new Date();
    const fechaExpiracion = req.body.fecha_expiracion
      ? fechaValida(req.body.fecha_expiracion)
      : null;
    if (req.body.fecha_emision && !fechaEmision) {
      return res.status(400).json({ mensaje: 'fecha_emision inválida' });
    }
    if (req.body.fecha_expiracion && !fechaExpiracion) {
      return res.status(400).json({ mensaje: 'fecha_expiracion inválida' });
    }

    const alerta = new Alerta({
      _id: await siguienteId(),
      tipo_alerta: tipoAlerta,
      mensaje,
      categoria,
      nivel_severidad: severidad,
      zona_afectada: punto.punto,
      radio_metros: req.body.radio_metros !== undefined && req.body.radio_metros !== ''
        ? Number(req.body.radio_metros)
        : undefined,
      usuarios_notificados: [],
      emitida_por: req.usuario?._id ?? null,
      fuente: texto(req.body.fuente) || undefined,
      url_oficial: texto(req.body.url_oficial) || undefined,
      activa: req.body.activa !== false,
      fecha_emision: fechaEmision,
      fecha_expiracion: fechaExpiracion,
      fecha_actualizacion: new Date()
    });

    await alerta.save();
    res.status(201).json({ mensaje: 'Alerta creada correctamente', alerta });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la alerta', error: error.message });
  }


  // Determinar topic según categoría/fuente
let topic = 'alertas_cauca'; // topic general
if (alerta.fuente === 'SGC' || alerta.tipo_alerta?.includes('sismo')) {
  topic = 'alertas_sismo';
} else if (alerta.fuente === 'IDEAM') {
  topic = 'alertas_hidro';
}

// Enviar push (no bloquear la respuesta)
enviarPushPorTopic(
  topic,
  {
    title: alerta.tipo_alerta || 'Nueva alerta',
    body: alerta.mensaje
  },
  {
    alertId: String(alerta._id),
    category: alerta.categoria || 'Alerta',
    severity: alerta.nivel_severidad || ''
  }
).catch(err => console.error('Push falló:', err.message))
};

// ============ ACTUALIZAR ============
export const actualizarAlerta = async (req, res) => {
  try {
    const alerta = await Alerta.findById(Number(req.params.id));
    if (!alerta) return res.status(404).json({ mensaje: 'Alerta no encontrada' });

    if (req.body.tipo_alerta !== undefined) {
      const tipoAlerta = texto(req.body.tipo_alerta);
      if (!tipoAlerta) return res.status(400).json({ mensaje: 'tipo_alerta no puede quedar vacío' });
      alerta.tipo_alerta = tipoAlerta;
    }

    if (req.body.mensaje !== undefined) {
      const mensaje = texto(req.body.mensaje);
      if (!mensaje) return res.status(400).json({ mensaje: 'mensaje no puede quedar vacío' });
      alerta.mensaje = mensaje;
    }

    if (req.body.categoria !== undefined) {
      const categoria = normalizarCategoria(req.body.categoria);
      if (!categoria) return res.status(400).json({ mensaje: 'Categoría inválida' });
      alerta.categoria = categoria;
    }

    if (req.body.nivel_severidad !== undefined) {
      const severidad = normalizarSeveridad(req.body.nivel_severidad);
      if (!severidad) return res.status(400).json({ mensaje: 'Nivel de severidad inválido' });
      alerta.nivel_severidad = severidad;
    }

    if (
      req.body.zona_afectada !== undefined ||
      req.body.latitud !== undefined ||
      req.body.longitud !== undefined
    ) {
      const punto = leerPunto(req.body);
      if (punto.error) return res.status(400).json({ mensaje: punto.error });
      if (punto.punto) alerta.zona_afectada = punto.punto;
    }

    if (req.body.radio_metros !== undefined) {
      alerta.radio_metros = req.body.radio_metros === '' || req.body.radio_metros === null
        ? undefined
        : Number(req.body.radio_metros);
    }

    if (req.body.fuente !== undefined) alerta.fuente = texto(req.body.fuente) || undefined;
    if (req.body.url_oficial !== undefined) {
      alerta.url_oficial = texto(req.body.url_oficial) || undefined;
    }
    if (req.body.activa !== undefined) alerta.activa = Boolean(req.body.activa);

    if (req.body.fecha_emision !== undefined) {
      const fecha = req.body.fecha_emision === '' ? null : fechaValida(req.body.fecha_emision);
      if (req.body.fecha_emision !== '' && !fecha) {
        return res.status(400).json({ mensaje: 'fecha_emision inválida' });
      }
      alerta.fecha_emision = fecha ?? undefined;
    }

    if (req.body.fecha_expiracion !== undefined) {
      const fecha = req.body.fecha_expiracion === '' ? null : fechaValida(req.body.fecha_expiracion);
      if (req.body.fecha_expiracion !== '' && !fecha) {
        return res.status(400).json({ mensaje: 'fecha_expiracion inválida' });
      }
      alerta.fecha_expiracion = fecha ?? undefined;
    }

    alerta.fecha_actualizacion = new Date();
    await alerta.save();

    res.status(200).json({ mensaje: 'Alerta actualizada correctamente', alerta });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar la alerta', error: error.message });
  }
};

// ============ ELIMINAR / DESACTIVAR ============
export const eliminarAlerta = async (req, res) => {
  try {
    const alerta = await Alerta.findById(Number(req.params.id));
    if (!alerta) return res.status(404).json({ mensaje: 'Alerta no encontrada' });

    if (req.query.permanente === '1') {
      await alerta.deleteOne();
      return res.status(200).json({ mensaje: 'Alerta eliminada permanentemente' });
    }

    alerta.activa = false;
    alerta.fecha_actualizacion = new Date();
    await alerta.save();
    res.status(200).json({ mensaje: 'Alerta desactivada correctamente', alerta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la alerta', error: error.message });
  }
};
