import ZonaRiesgo from '../models/ZonaRiesgo.js';


export const crearZonaRiesgo = async (req, res) => {
  try {
    // Tomamos los datos del body
    const {
      nombre_zona,
      tipo,
      nivel_peligro,
      descripcion,
      latitud,
      longitud,
      radio_metros
    } = req.body;

    // Validación 1: campos obligatorios
    if (!nombre_zona || !tipo || !nivel_peligro || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    // Validación 2: niveles de peligro válidos
    const nivelesValidos = ['Moderado', 'Alto', 'Inminente'];
    if (!nivelesValidos.includes(nivel_peligro)) {
      return res.status(400).json({ mensaje: 'Nivel de peligro inválido' });
    }

    // Generamos nuevo _id
    const total = await ZonaRiesgo.countDocuments();
    const nuevoId = total + 1;

    // Creamos la zona
    const nuevaZona = new ZonaRiesgo({
      _id: nuevoId,
      nombre_zona,
      tipo,
      nivel_peligro,
      descripcion,
      latitud,
      longitud,
      radio_metros,
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
      const distancia = calcularDistancia(lat, lng, zona.latitud, zona.longitud);
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