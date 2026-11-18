import ZonaRiesgo from '../models/ZonaRiesgo.js';
import { siguienteId } from '../utils/ids.js';

const NIVELES = ['Moderado', 'Alto', 'Inminente'];

const siguienteIdZona = () => siguienteId(ZonaRiesgo);

const texto = (valor) => String(valor ?? '').trim();

const fechaValida = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const leerCoordenadas = (body) => {
  const centro = body.coordenadas_centro;
  if (centro && centro.type === 'Point' && Array.isArray(centro.coordinates) && centro.coordinates.length >= 2) {
    const lng = Number(centro.coordinates[0]);
    const lat = Number(centro.coordinates[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { error: 'Coordenadas del centro inválidas' };
    }
    return { lat, lng };
  }

  if (body.latitud !== undefined || body.longitud !== undefined) {
    const lat = Number(body.latitud);
    const lng = Number(body.longitud);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { error: 'Latitud o longitud inválidas (lat -90..90, lng -180..180)' };
    }
    return { lat, lng };
  }

  return {};
};

const esGeometriaValida = (geometria) => {
  if (!geometria || typeof geometria !== 'object') return false;
  return ['Polygon', 'MultiPolygon'].includes(geometria.type) && Array.isArray(geometria.coordinates);
};

// ============ LISTAR ============
// GET /api/zonas-riesgo
//   todas=1  incluye inactivas
//   desde=ISO para sincronización incremental
export const listarZonasRiesgo = async (req, res) => {
  try {
    const incluirTodas = ['1', 'true', 'si'].includes(texto(req.query.todas).toLowerCase());
    const filtro = incluirTodas ? {} : { activa: { $ne: false } };

    const desde = fechaValida(req.query.desde);
    if (desde) filtro.fecha_actualizacion = { $gte: desde };

    const zonas = await ZonaRiesgo.find(filtro).sort({ fecha_registro: -1, _id: -1 });
    res.status(200).json({
      mensaje: 'Zonas de riesgo',
      total: zonas.length,
      zonas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar zonas', error: error.message });
  }
};

export const listarZonas = listarZonasRiesgo;

// ============ OBTENER UNA ============
export const obtenerZonaRiesgo = async (req, res) => {
  try {
    const zona = await ZonaRiesgo.findById(Number(req.params.id));
    if (!zona) return res.status(404).json({ mensaje: 'Zona de riesgo no encontrada' });
    res.status(200).json(zona);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar la zona', error: error.message });
  }
};

// ============ CREAR ============
export const crearZonaRiesgo = async (req, res) => {
  try {
    const {
      nombre_zona,
      tipo,
      tipo_riesgo,
      nivel_peligro,
      descripcion,
      radio_metros,
      estado_zona,
      poblacion_estimada,
      activa,
      area_afectada,
      fecha_deteccion
    } = req.body;

    const tipoFinal = texto(tipo || tipo_riesgo);
    if (!texto(nombre_zona) || !tipoFinal || !texto(nivel_peligro)) {
      return res.status(400).json({
        mensaje: 'Faltan datos obligatorios (nombre_zona, tipo, nivel_peligro)'
      });
    }

    const nivel = NIVELES.find((n) => n.toLowerCase() === texto(nivel_peligro).toLowerCase());
    if (!nivel) {
      return res.status(400).json({ mensaje: 'Nivel de peligro inválido (Moderado, Alto, Inminente)' });
    }

    const coords = leerCoordenadas(req.body);
    if (coords.error) return res.status(400).json({ mensaje: coords.error });
    if (coords.lat === undefined) {
      return res.status(400).json({ mensaje: 'Debes enviar latitud/longitud o coordenadas_centro' });
    }

    if (area_afectada && !esGeometriaValida(area_afectada)) {
      return res.status(400).json({ mensaje: 'area_afectada debe ser un Polygon o MultiPolygon GeoJSON' });
    }

    const radio = radio_metros === undefined || radio_metros === '' ? 300 : Number(radio_metros);
    if (!Number.isFinite(radio) || radio <= 0) {
      return res.status(400).json({ mensaje: 'radio_metros debe ser un número mayor que 0' });
    }

    const zona = new ZonaRiesgo({
      _id: await siguienteIdZona(),
      nombre_zona: texto(nombre_zona),
      tipo: tipoFinal,
      tipo_riesgo: texto(tipo_riesgo || tipo),
      nivel_peligro: nivel,
      descripcion: texto(descripcion) || undefined,
      latitud: coords.lat,
      longitud: coords.lng,
      coordenadas_centro: { type: 'Point', coordinates: [coords.lng, coords.lat] },
      radio_metros: radio,
      area_afectada: area_afectada || undefined,
      estado_zona: texto(estado_zona) || undefined,
      poblacion_estimada: poblacion_estimada !== undefined && poblacion_estimada !== ''
        ? Number(poblacion_estimada)
        : undefined,
      activa: activa !== false,
      fecha_registro: new Date(),
      fecha_deteccion: fechaValida(fecha_deteccion) || undefined,
      fecha_actualizacion: new Date()
    });

    await zona.save();
    res.status(201).json({ mensaje: 'Zona de riesgo registrada correctamente', zona });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al registrar zona', error: error.message });
  }
};

// ============ ACTUALIZAR ============
export const actualizarZonaRiesgo = async (req, res) => {
  try {
    const zona = await ZonaRiesgo.findById(Number(req.params.id));
    if (!zona) return res.status(404).json({ mensaje: 'Zona de riesgo no encontrada' });

    if (req.body.nombre_zona !== undefined) {
      const nombre = texto(req.body.nombre_zona);
      if (!nombre) return res.status(400).json({ mensaje: 'nombre_zona no puede quedar vacío' });
      zona.nombre_zona = nombre;
    }

    if (req.body.tipo !== undefined || req.body.tipo_riesgo !== undefined) {
      const tipo = texto(req.body.tipo || req.body.tipo_riesgo);
      if (!tipo) return res.status(400).json({ mensaje: 'tipo no puede quedar vacío' });
      zona.tipo = tipo;
      zona.tipo_riesgo = tipo;
    }

    if (req.body.nivel_peligro !== undefined) {
      const nivel = NIVELES.find(
        (n) => n.toLowerCase() === texto(req.body.nivel_peligro).toLowerCase()
      );
      if (!nivel) {
        return res.status(400).json({ mensaje: 'Nivel de peligro inválido (Moderado, Alto, Inminente)' });
      }
      zona.nivel_peligro = nivel;
    }

    if (req.body.descripcion !== undefined) {
      zona.descripcion = texto(req.body.descripcion) || undefined;
    }

    if (
      req.body.coordenadas_centro !== undefined ||
      req.body.latitud !== undefined ||
      req.body.longitud !== undefined
    ) {
      const coords = leerCoordenadas(req.body);
      if (coords.error) return res.status(400).json({ mensaje: coords.error });
      if (coords.lat !== undefined) {
        zona.latitud = coords.lat;
        zona.longitud = coords.lng;
        zona.coordenadas_centro = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      }
    }

    if (req.body.radio_metros !== undefined) {
      const radio = Number(req.body.radio_metros);
      if (!Number.isFinite(radio) || radio <= 0) {
        return res.status(400).json({ mensaje: 'radio_metros debe ser un número mayor que 0' });
      }
      zona.radio_metros = radio;
    }

    if (req.body.area_afectada !== undefined) {
      if (req.body.area_afectada && !esGeometriaValida(req.body.area_afectada)) {
        return res.status(400).json({ mensaje: 'area_afectada debe ser Polygon o MultiPolygon GeoJSON' });
      }
      zona.area_afectada = req.body.area_afectada || undefined;
    }

    if (req.body.estado_zona !== undefined) {
      zona.estado_zona = texto(req.body.estado_zona) || undefined;
    }
    if (req.body.poblacion_estimada !== undefined) {
      zona.poblacion_estimada = req.body.poblacion_estimada === ''
        ? undefined
        : Number(req.body.poblacion_estimada);
    }
    if (req.body.activa !== undefined) zona.activa = Boolean(req.body.activa);

    if (req.body.fecha_deteccion !== undefined) {
      const fecha = req.body.fecha_deteccion === '' ? null : fechaValida(req.body.fecha_deteccion);
      if (req.body.fecha_deteccion !== '' && !fecha) {
        return res.status(400).json({ mensaje: 'fecha_deteccion inválida' });
      }
      zona.fecha_deteccion = fecha || undefined;
    }

    zona.fecha_actualizacion = new Date();
    await zona.save();
    res.status(200).json({ mensaje: 'Zona de riesgo actualizada correctamente', zona });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar la zona', error: error.message });
  }
};

// ============ ELIMINAR / DESACTIVAR ============
export const eliminarZonaRiesgo = async (req, res) => {
  try {
    const zona = await ZonaRiesgo.findById(Number(req.params.id));
    if (!zona) return res.status(404).json({ mensaje: 'Zona de riesgo no encontrada' });

    if (req.query.permanente === '1') {
      await zona.deleteOne();
      return res.status(200).json({ mensaje: 'Zona eliminada permanentemente' });
    }

    zona.activa = false;
    zona.fecha_actualizacion = new Date();
    await zona.save();
    res.status(200).json({ mensaje: 'Zona desactivada correctamente', zona });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la zona', error: error.message });
  }
};

// ============ CERCANAS ============
export const consultarZonasCercanas = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ mensaje: 'Debes enviar lat y lng como números' });
    }

    const todas = await ZonaRiesgo.find({ activa: { $ne: false } });

    const zonasCercanas = todas.filter((zona) => {
      const [zLng, zLat] = zona.coordenadas_centro?.coordinates ?? [zona.longitud, zona.latitud];
      if (zLat === undefined || zLng === undefined) return false;
      const distancia = calcularDistancia(lat, lng, zLat, zLng);
      return distancia <= zona.radio_metros;
    });

    if (zonasCercanas.length === 0) {
      return res.status(200).json({ mensaje: 'No hay zonas de riesgo cercanas', zonas: [] });
    }

    res.status(200).json({
      mensaje: 'Zonas de riesgo cercanas',
      total: zonasCercanas.length,
      zonas: zonasCercanas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar zonas', error: error.message });
  }
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
