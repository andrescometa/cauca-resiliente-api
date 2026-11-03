// Importamos el modelo
import mongoose from 'mongoose';
import Solicitud from '../models/Solicitud.js';


export const crearSolicitud = async (req, res) => {
  try {
    // Tomamos los datos del body
    const {
      usuario_id,
      tipo_ayuda,
      descripcion_emergencia,
      nivel_prioridad,
      latitud,
      longitud,
      personas_afectadas,
      requiere_ambulancia
    } = req.body;

    // Validación 1: campos obligatorios
    if (!usuario_id || !tipo_ayuda || !nivel_prioridad) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios (usuario_id, tipo_ayuda, nivel_prioridad)' });
    }

    // Validación 2: usuario_id debe ser un ObjectId de Mongo
    if (!mongoose.Types.ObjectId.isValid(usuario_id)) {
      return res.status(400).json({ mensaje: 'usuario_id inválido' });
    }

    // Validación 3: tipo de ayuda válido
    const tiposValidos = ['Rescate', 'Atención Médica', 'Víveres/Agua', 'Evacuación', 'Incendio', 'Apoyo Logístico', 'Albergue'];
    if (!tiposValidos.includes(tipo_ayuda)) {
      return res.status(400).json({ mensaje: 'Tipo de ayuda inválido' });
    }

    // Validación 4: prioridad válida
    const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    if (!prioridadesValidas.includes(nivel_prioridad)) {
      return res.status(400).json({ mensaje: 'Prioridad inválida' });
    }

    // Validación 5: latitud y longitud (opcionales, pero válidas si vienen)
    const lat = latitud === undefined || latitud === null || latitud === '' ? undefined : Number(latitud);
    const lng = longitud === undefined || longitud === null || longitud === '' ? undefined : Number(longitud);

    if (lat !== undefined && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
      return res.status(400).json({ mensaje: 'Latitud inválida (debe estar entre -90 y 90)' });
    }

    if (lng !== undefined && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
      return res.status(400).json({ mensaje: 'Longitud inválida (debe estar entre -180 y 180)' });
    }

    // Creamos la solicitud (Mongo genera el _id)
    const nuevaSolicitud = new Solicitud({
      usuario_id,
      tipo_ayuda,
      descripcion_emergencia,
      nivel_prioridad,
      estado_solicitud: 'Pendiente',           // Siempre empieza Pendiente
      latitud: lat,
      longitud: lng,
      personas_afectadas,
      requiere_ambulancia,
      fecha_hora: new Date()
    });

    await nuevaSolicitud.save();

    res.status(201).json({
      mensaje: 'Solicitud creada correctamente',
      solicitud: nuevaSolicitud
    });

  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear solicitud', error: error.message });
  }
};


export const listarSolicitudes = async (req, res) => {
  try {
    // Orden de prioridad personalizado (Crítica primero)
    const ordenPrioridad = { 'Crítica': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };

    // Traemos todas las solicitudes
    const solicitudes = await Solicitud.find();

    // Las ordenamos por prioridad (Crítica primero) usando el mapa de arriba
    solicitudes.sort((a, b) => ordenPrioridad[a.nivel_prioridad] - ordenPrioridad[b.nivel_prioridad]);

    res.status(200).json({
      mensaje: 'Solicitudes priorizadas',
      total: solicitudes.length,
      solicitudes
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar solicitudes', error: error.message });
  }
};