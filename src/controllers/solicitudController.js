// ===== ARCHIVO: controllers/solicitudController.js =====
import Solicitud from '../models/Solicitud.js';
import Usuario from '../models/usuario.js';

export const crearSolicitud = async (req, res) => {
  try {
    const { usuario_id, tipo_ayuda, descripcion_emergencia, nivel_prioridad } = req.body;

    if (!usuario_id || !tipo_ayuda || !nivel_prioridad) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    const solicitudActiva = await Solicitud.findOne({ 
      usuario_id: Number(usuario_id),
      estado_solicitud: { $in: ['Pendiente', 'En proceso', 'En camino', 'En el sitio'] }
    });

    if (solicitudActiva) {
      return res.status(400).json({ mensaje: 'Ya tienes una emergencia activa.' });
    }

    const ultimaSolicitud = await Solicitud.findOne({ _id: { $type: 'number' } }).sort({ _id: -1 });
    const nuevoId = ultimaSolicitud ? ultimaSolicitud._id + 1 : 1;

    const nuevaSolicitud = new Solicitud({
      _id: nuevoId,
      usuario_id: Number(usuario_id),
      tipo_ayuda,
      descripcion_emergencia: descripcion_emergencia || 'Sin descripción',
      nivel_prioridad,
      estado_solicitud: 'Pendiente',
      latitud: 2.4448,
      longitud: -76.6147,
      fecha_hora: new Date()
    });

    await nuevaSolicitud.save();

    res.status(201).json({ mensaje: 'Solicitud creada', solicitud: nuevaSolicitud });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear', error: error.message });
  }
};

export const listarSolicitudes = async (req, res) => {
  try {
    const ordenPrioridad = { 'Crítica': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };
    const solicitudes = await Solicitud.find();
    solicitudes.sort((a, b) => (ordenPrioridad[a.nivel_prioridad] || 5) - (ordenPrioridad[b.nivel_prioridad] || 5));
    res.status(200).json({ mensaje: 'Solicitudes', total: solicitudes.length, solicitudes });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error', error: error.message });
  }
};

export const actualizarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_solicitud, socorrista_id } = req.body;

    // SOLUCIONAMOS EL WARNING AQUÍ
    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      id,
      { 
        ...(estado_solicitud && { estado_solicitud }),
        ...(socorrista_id && { socorrista_id: Number(socorrista_id) })
      },
      { returnDocument: 'after' }
    );

    if (!solicitudActualizada) return res.status(404).json({ mensaje: 'No encontrada' });
    res.status(200).json({ mensaje: 'Actualizada', solicitud: solicitudActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error', error: error.message });
  }
};

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