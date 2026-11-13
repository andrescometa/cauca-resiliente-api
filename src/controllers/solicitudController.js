import Solicitud from '../models/Solicitud.js';

export const crearSolicitud = async (req, res) => {
  try {
    const { usuario_id, tipo_ayuda, descripcion_emergencia, nivel_prioridad, latitud, longitud, personas_afectadas, requiere_ambulancia } = req.body;
    const total = await Solicitud.countDocuments();
    const nuevoId = total + 1;

    const nuevaSolicitud = new Solicitud({
      _id: nuevoId,
      usuario_id,
      tipo_ayuda,
      descripcion_emergencia,
      nivel_prioridad,
      estado_solicitud: 'Pendiente',
      latitud,
      longitud,
      personas_afectadas,
      requiere_ambulancia,
      fecha_hora: new Date()
    });

    await nuevaSolicitud.save();
    res.status(201).json({ mensaje: 'Solicitud creada', solicitud: nuevaSolicitud });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear solicitud', error: error.message });
  }
};

export const listarSolicitudes = async (req, res) => {
  try {
    const ordenPrioridad = { 'Crítica': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };
    const solicitudes = await Solicitud.find();
    solicitudes.sort((a, b) => ordenPrioridad[a.nivel_prioridad] - ordenPrioridad[b.nivel_prioridad]);
    res.status(200).json({ mensaje: 'Solicitudes priorizadas', total: solicitudes.length, solicitudes });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

// ACTUALIZADA: Ahora acepta estado_solicitud y socorrista_id
export const actualizarEstadoSolicitud = async (req, res) => {
  try {
    const solicitudId = Number(req.params.id);
    const { estado_solicitud, socorrista_id } = req.body;

    const datosAActualizar = {};
    if (estado_solicitud) datosAActualizar.estado_solicitud = estado_solicitud;
    if (socorrista_id) datosAActualizar.socorrista_id = socorrista_id;

    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      solicitudId,
      datosAActualizar,
      { new: true }
    );

    if (!solicitudActualizada) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    res.status(200).json({ mensaje: 'Actualizado', solicitud: solicitudActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};