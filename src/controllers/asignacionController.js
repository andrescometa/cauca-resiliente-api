import Asignacion from '../models/Asignacion.js';
import Solicitud from '../models/Solicitud.js';

export const crearAsignacion = async (req, res) => {
  try {
    // Aceptamos socorrista_usuario_id (esquema actual) y socorrista_id (alias).
    const { solicitud_id, socorrista_usuario_id, socorrista_id } = req.body;
    const socorrista = socorrista_usuario_id || socorrista_id;

    // Validación 1: campos obligatorios
    if (!solicitud_id || !socorrista) {
      return res.status(400).json({ mensaje: 'Faltan datos (solicitud_id, socorrista_usuario_id)' });
    }

    // Validación 2: identificadores numéricos válidos
    const solicitudId = Number(solicitud_id);
    const socorristaId = Number(socorrista);
    if (!Number.isInteger(solicitudId) || !Number.isInteger(socorristaId)) {
      return res.status(400).json({ mensaje: 'solicitud_id o socorrista_usuario_id inválido' });
    }

    // Validación 3: la solicitud debe existir
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'La solicitud no existe' });
    }

    // Validación 4: la solicitud no debe tener ya una asignación activa
    const existente = await Asignacion.findOne({
      solicitud_id: solicitudId,
      estado_atencion: { $ne: 'Finalizado' }
    });
    if (existente) {
      return res.status(400).json({ mensaje: 'La solicitud ya tiene una asignación activa' });
    }

    // Generamos nuevo _id numérico
    const total = await Asignacion.countDocuments();
    const nuevoId = total + 1;

    const nuevaAsignacion = new Asignacion({
      _id: nuevoId,
      solicitud_id: solicitudId,
      socorrista_usuario_id: socorristaId,
      socorrista_id: socorristaId,
      estado_atencion: 'En camino',
      fecha_asignacion: new Date(),
      fecha_hora_asignacion: new Date()
    });

    await nuevaAsignacion.save();

    res.status(201).json({
      mensaje: 'Socorrista asignado correctamente',
      asignacion: nuevaAsignacion
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar', error: error.message });
  }
};

export const listarAsignacionesPorSocorrista = async (req, res) => {
  try {
    const { socorristaId } = req.params;
    const id = Number(socorristaId);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensaje: 'socorristaId inválido' });
    }

    const asignaciones = await Asignacion
      .find({
        $or: [
          { socorrista_usuario_id: id },
          { socorrista_id: id }
        ]
      })
      .sort({ fecha_hora_asignacion: -1 });

    res.status(200).json({
      mensaje: 'Solicitudes asignadas',
      total: asignaciones.length,
      asignaciones
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar asignaciones', error: error.message });
  }
};

export const actualizarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_atencion } = req.body;

    const asignacionId = Number(id);
    if (!Number.isInteger(asignacionId)) {
      return res.status(400).json({ mensaje: 'ID de asignación inválido' });
    }

    const estadosValidos = ['En camino', 'En el sitio', 'Finalizado'];
    if (!estadosValidos.includes(estado_atencion)) {
      return res.status(400).json({ mensaje: 'Estado de atención inválido' });
    }

    const asignacion = await Asignacion.findById(asignacionId);
    if (!asignacion) {
      return res.status(404).json({ mensaje: 'Asignación no encontrada' });
    }

    asignacion.estado_atencion = estado_atencion;
    if (estado_atencion === 'En el sitio' && !asignacion.fecha_hora_llegada) {
      asignacion.fecha_hora_llegada = new Date();
    }
    if (estado_atencion === 'Finalizado') {
      asignacion.fecha_hora_cierre = new Date();
    }
    await asignacion.save();

    if (estado_atencion === 'Finalizado' && asignacion.solicitud_id) {
      await Solicitud.findByIdAndUpdate(asignacion.solicitud_id, {
        estado_solicitud: 'Finalizado'
      });
    }

    res.status(200).json({
      mensaje: 'Estado de asignación actualizado',
      asignacion
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};
