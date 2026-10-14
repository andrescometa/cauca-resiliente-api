// Importamos el modelo
import Ubicacion from '../models/Ubicacion.js';

export const crearUbicacion = async (req, res) => {
  try {
    // Tomamos los datos que vienen del body (Postman)
    const { usuario_id, latitud, longitud, direccion_aproximada, precision_metros, bateria } = req.body;

    // Validación: usuario_id, latitud y longitud son obligatorios
    if (!usuario_id || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios (usuario_id, latitud, longitud)' });
    }

    // Generamos un nuevo _id basado en el total de documentos
    const total = await Ubicacion.countDocuments();
    const nuevoId = total + 1;

    // Creamos la ubicación
    const nuevaUbicacion = new Ubicacion({
      _id: nuevoId,
      usuario_id,
      latitud,
      longitud,
      direccion_aproximada,
      precision_metros,
      bateria,
      fecha_hora: new Date()              // Fecha automática del servidor
    });

    // La guardamos en MongoDB
    await nuevaUbicacion.save();

    // Respondemos 201 (creado)
    res.status(201).json({
      mensaje: 'Ubicación registrada correctamente',
      ubicacion: nuevaUbicacion
    });

  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar ubicación',
      error: error.message
    });
  }
};

export const consultarHistorial = async (req, res) => {
  try {
    // Tomamos el usuarioId de la URL
    const usuarioId = Number(req.params.usuarioId);

    // Buscamos todas las ubicaciones de ese usuario, ordenadas de más reciente a más antigua
    const historial = await Ubicacion.find({ usuario_id: usuarioId }).sort({ fecha_hora: -1 });

    // Si no hay ubicaciones, 404
    if (historial.length === 0) {
      return res.status(404).json({ mensaje: 'No hay ubicaciones para ese usuario' });
    }

    // Respondemos 200 con el historial
    res.status(200).json({
      mensaje: 'Historial de ubicaciones',
      total: historial.length,
      historial
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar historial', error: error.message });
  }
};