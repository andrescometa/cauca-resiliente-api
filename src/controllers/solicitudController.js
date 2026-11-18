import Solicitud from '../models/Solicitud.js';
import Asignacion from '../models/Asignacion.js';
import Usuario from '../models/usuario.js';
import Ubicacion from '../models/Ubicacion.js';

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

    // Adjuntamos los datos del usuario (incluida su foto) para que la app
    // pueda mostrar la cara del usuario en el marcador del mapa.
    const usuarioIds = [...new Set(solicitudes.map((s) => s.usuario_id))];
    const usuarios = await Usuario.find(
      { _id: { $in: usuarioIds } },
      { nombres: 1, apellidos: 1, foto: 1, telefono: 1 }
    ).lean();
    const usuarioPorId = new Map(usuarios.map((u) => [u._id, u]));

    const resultado = solicitudes.map((solicitud) => {
      const usuario = usuarioPorId.get(solicitud.usuario_id);
      return {
        ...solicitud.toObject(),
        usuario: usuario
          ? {
              _id: usuario._id,
              nombres: usuario.nombres,
              apellidos: usuario.apellidos,
              telefono: usuario.telefono,
              foto: usuario.foto ?? null
            }
          : null
      };
    });

    res.status(200).json({ mensaje: 'Solicitudes priorizadas', total: resultado.length, solicitudes: resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

export const listarSolicitudesPendientes = async (req, res) => {
  try {
    const ordenPrioridad = { 'Crítica': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };

    // Una solicitud sigue pendiente si no tiene una asignación activa ni un
    // socorrista asignado. Esto evita que varios socorristas tomen la misma.
    const asignacionesActivas = await Asignacion.find(
      { estado_atencion: { $ne: 'Finalizado' } },
      { solicitud_id: 1 }
    ).lean();
    const idsAsignados = new Set(asignacionesActivas.map((a) => a.solicitud_id));

    const solicitudes = await Solicitud.find({
      estado_solicitud: { $nin: ['Atendido', 'Finalizado', 'Cerrado', 'Cancelado'] }
    });
    const pendientes = solicitudes
      .filter((s) => !idsAsignados.has(s._id) && !s.socorrista_id)
      .sort((a, b) => (ordenPrioridad[a.nivel_prioridad] ?? 99) - (ordenPrioridad[b.nivel_prioridad] ?? 99));

    const usuarioIds = [...new Set(pendientes.map((s) => s.usuario_id))];
    if (usuarioIds.length === 0) {
      return res.status(200).json({ mensaje: 'Solicitudes pendientes', total: 0, solicitudes: [] });
    }

    const [usuarios, ubicaciones] = await Promise.all([
      Usuario.find(
        { _id: { $in: usuarioIds } },
        { nombres: 1, apellidos: 1, telefono: 1, direccion: 1, ubicacion_actual: 1, foto: 1 }
      ).lean(),
      Ubicacion.find({ usuario_id: { $in: usuarioIds } })
        .sort({ fecha_hora: -1 })
        .lean()
    ]);

    const usuarioPorId = new Map(usuarios.map((u) => [u._id, u]));
    const ultimaUbicacionPorUsuario = new Map();
    for (const ubicacion of ubicaciones) {
      if (!ultimaUbicacionPorUsuario.has(ubicacion.usuario_id)) {
        ultimaUbicacionPorUsuario.set(ubicacion.usuario_id, ubicacion);
      }
    }

    const resultado = pendientes.map((solicitud) => {
      const usuario = usuarioPorId.get(solicitud.usuario_id);
      const ultimaUbicacion = ultimaUbicacionPorUsuario.get(solicitud.usuario_id);
      const coords = usuario?.ubicacion_actual?.coordinates;

      const latitud = ultimaUbicacion?.latitud
        ?? (Array.isArray(coords) && coords.length === 2 ? coords[1] : solicitud.latitud);
      const longitud = ultimaUbicacion?.longitud
        ?? (Array.isArray(coords) && coords.length === 2 ? coords[0] : solicitud.longitud);

      return {
        ...solicitud.toObject(),
        usuario: usuario ? {
          _id: usuario._id,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          foto: usuario.foto ?? null
        } : null,
        ubicacion_tiempo_real: {
          latitud,
          longitud,
          fecha_hora: ultimaUbicacion?.fecha_hora ?? solicitud.fecha_hora ?? null,
          precision_metros: ultimaUbicacion?.precision_metros ?? null,
          direccion_aproximada: ultimaUbicacion?.direccion_aproximada ?? usuario?.direccion ?? null
        }
      };
    });

    res.status(200).json({
      mensaje: 'Solicitudes pendientes',
      total: resultado.length,
      solicitudes: resultado
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar pendientes', error: error.message });
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

// Alias mantenido por compatibilidad con la versión remota de las rutas.
export const actualizarSolicitud = actualizarEstadoSolicitud;

// Devuelve la solicitud activa del usuario junto con el nombre del socorrista.
export const obtenerMiSolicitudActiva = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const solicitud = await Solicitud.findOne({
      usuario_id: Number(usuarioId),
      estado_solicitud: { $in: ['Pendiente', 'En proceso', 'En camino', 'En el sitio'] }
    });

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'No hay emergencias activas' });
    }

    let nombre_socorrista = null;
    if (solicitud.socorrista_id) {
      const socorrista = await Usuario.findOne({ _id: solicitud.socorrista_id });
      if (socorrista) {
        nombre_socorrista = `${socorrista.nombres} ${socorrista.apellidos}`;
      }
    }

    res.status(200).json({
      solicitud: {
        ...solicitud.toObject(),
        nombre_socorrista
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error', error: error.message });
  }
};
