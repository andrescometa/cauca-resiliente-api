// ===== ARCHIVO: controllers/estadoController.js =====
import EstadoSeguridad from '../models/EstadoSeguridad.js';

export const actualizarEstado = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const { estado, mensaje_estado } = req.body;

    const estadosValidos = ['A salvo', 'En riesgo', 'Atrapado', 'Desaparecido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    // Buscamos si ya tiene un registro de estado
    let estadoUsuario = await EstadoSeguridad.findOne({ usuario_id: usuarioId });

    if (estadoUsuario) {
      estadoUsuario.estado = estado;
      estadoUsuario.mensaje_estado = mensaje_estado;
      estadoUsuario.fecha_ultima_actualizacion = new Date();
      await estadoUsuario.save();
    } else {
      // Si no existe, creamos el registro
      const ultimoEstado = await EstadoSeguridad.findOne({ _id: { $type: 'number' } }).sort({ _id: -1 });
      const nuevoId = ultimoEstado ? ultimoEstado._id + 1 : 1;

      estadoUsuario = new EstadoSeguridad({
        _id: nuevoId,
        usuario_id: usuarioId,
        estado: estado,
        mensaje_estado: mensaje_estado,
        fecha_ultima_actualizacion: new Date()
      });
      await estadoUsuario.save();
    }

    res.status(200).json({ mensaje: 'Estado guardado', estado: estadoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar', error: error.message });
  }
};

export const consultarEstado = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const estado = await EstadoSeguridad.findOne({ usuario_id: usuarioId });

    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado no encontrado' });
    }
    res.status(200).json(estado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar', error: error.message });
  }
};