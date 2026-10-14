// Importamos el modelo
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

    // Validación 2: prioridad válida
    const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    if (!prioridadesValidas.includes(nivel_prioridad)) {
      return res.status(400).json({ mensaje: 'Prioridad inválida' });
    }

    // Generamos nuevo _id
    const total = await Solicitud.countDocuments();
    const nuevoId = total + 1;

    // Creamos la solicitud
    const nuevaSolicitud = new Solicitud({
      _id: nuevoId,
      usuario_id,
      tipo_ayuda,
      descripcion_emergencia,
      nivel_prioridad,
      estado_solicitud: 'Pendiente',           // Siempre empieza Pendiente
      latitud,
      longitud,
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