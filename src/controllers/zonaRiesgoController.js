import ZonaRiesgo from '../models/ZonaRiesgo.js';

export const crearZonaRiesgo = async (req, res) => {
  try {
    // Aceptamos el formato nuevo (tipo_riesgo, coordenadas_centro) y el anterior (tipo, latitud/longitud)
    const {
      nombre_zona,
      tipo,
      tipo_riesgo,
      nivel_peligro,
      descripcion,
      latitud,
      longitud,
      coordenadas_centro,
      radio_metros,
      estado_zona,
      poblacion_estimada,
      activa
    } = req.body;

    // Coordenadas: GeoJSON [lng, lat] o latitud/longitud sueltas
    const coords = coordenadas_centro?.coordinates
      ?? (latitud !== undefined && longitud !== undefined
        ? [Number(longitud), Number(latitud)]
        : undefined);

    // Validación 1: campos obligatorios
    if (!nombre_zona || !(tipo || tipo_riesgo) || !nivel_peligro || !coords || coords.length < 2) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios (nombre_zona, tipo, nivel_peligro, coordenadas)' });
    }

    // Validación 2: niveles de peligro válidos
    const nivelesValidos = ['Moderado', 'Alto', 'Inminente'];
    if (!nivelesValidos.includes(nivel_peligro)) {
      return res.status(400).json({ mensaje: 'Nivel de peligro inválido' });
    }

    const [lng, lat] = coords.map(Number);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ mensaje: 'Latitud inválida (debe estar entre -90 y 90)' });
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ mensaje: 'Longitud inválida (debe estar entre -180 y 180)' });
    }

    // Generamos nuevo _id numérico
    const total = await ZonaRiesgo.countDocuments();
    const nuevoId = total + 1;

    // Creamos la zona
    const nuevaZona = new ZonaRiesgo({
      _id: nuevoId,
      nombre_zona,
      tipo: tipo || tipo_riesgo,
      tipo_riesgo: tipo_riesgo || tipo,
      nivel_peligro,
      descripcion,
      latitud: lat,
      longitud: lng,
      coordenadas_centro: { type: 'Point', coordinates: [lng, lat] },
      radio_metros,
      estado_zona,
      poblacion_estimada,
      activa: activa === undefined ? true : activa,
      fecha_registro: new Date()
    });

    await nuevaZona.save();

    res.status(201).json({
      mensaje: 'Zona de riesgo registrada correctamente',
      zona: nuevaZona
    });

  } catch (error) {
    res.status(400).json({ mensaje: 'Error al registrar zona', error: error.message });
  }
};

export const consultarZonasCercanas = async (req, res) => {
  try {
    // Tomamos las coordenadas del query string (?lat=...&lng=...)
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    // Validación
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ mensaje: 'Debes enviar lat y lng como números' });
    }

    // Traemos todas las zonas
    const todas = await ZonaRiesgo.find();

    // Filtramos las que estén dentro del radio de afectación
    // Usamos la fórmula de Haversine para calcular distancia entre 2 puntos
    const zonasCercanas = todas.filter((zona) => {
      const [zLng, zLat] = zona.coordenadas_centro?.coordinates ?? [zona.longitud, zona.latitud];
      if (zLat === undefined || zLng === undefined) return false;
      const distancia = calcularDistancia(lat, lng, zLat, zLng);
      return distancia <= zona.radio_metros;   // Solo las que están dentro del radio
    });

    // Respondemos
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

// ============ LISTAR TODAS LAS ZONAS DE RIESGO ============
// La app Android espera { mensaje, total, zonas }.
export const listarZonasRiesgo = async (req, res) => {
  try {
    const zonas = await ZonaRiesgo.find({ activa: { $ne: false } });
    res.status(200).json({
      mensaje: 'Zonas de riesgo',
      total: zonas.length,
      zonas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar zonas', error: error.message });
  }
};

// Alias en plural conservado por compatibilidad con clientes anteriores.
export const listarZonas = listarZonasRiesgo;

// Usa la fórmula de Haversine para calcular la distancia entre 2 puntos en metros
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;                                  // Radio de la Tierra en metros
  const rad = Math.PI / 180;                          // Conversión de grados a radianes
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;                                       // Distancia en metros
}
