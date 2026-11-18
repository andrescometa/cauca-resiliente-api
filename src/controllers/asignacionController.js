import Asignacion from '../models/Asignacion.js';
import Solicitud from '../models/Solicitud.js';
import { siguienteId } from '../utils/ids.js';

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

    // Generamos nuevo _id numérico de forma atómica
    const nuevoId = await siguienteId(Asignacion);

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

export const obtenerSeguimientoSolicitud = async (req, res) => {
  try {
    const solicitudId = Number(req.params.solicitudId);
    if (!Number.isInteger(solicitudId)) {
      return res.status(400).json({ mensaje: 'solicitudId inválido' });
    }

    const [solicitud, asignacion] = await Promise.all([
      Solicitud.findById(solicitudId),
      Asignacion
        .findOne({ solicitud_id: solicitudId })
        .sort({ fecha_hora_asignacion: -1 })
    ]);

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'La solicitud no existe' });
    }

    res.status(200).json({
      mensaje: 'Seguimiento de solicitud',
      solicitud,
      asignacion
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar seguimiento', error: error.message });
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

    // Los identificadores son numéricos, por eso no se puede usar populate().
    // Adjuntamos la solicitud a cada asignación manualmente.
    const solicitudes = await Solicitud.find({
      _id: { $in: asignaciones.map((a) => a.solicitud_id) }
    });
    const porId = new Map(solicitudes.map((s) => [s._id, s]));

    const asignacionesConSolicitud = asignaciones.map((a) => ({
      ...a.toObject(),
      solicitud_id: porId.get(a.solicitud_id) ?? a.solicitud_id
    }));

    res.status(200).json({
      mensaje: 'Solicitudes asignadas',
      total: asignacionesConSolicitud.length,
      asignaciones: asignacionesConSolicitud
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
