import EstadoSeguridad from '../models/EstadoSeguridad.js';

export const actualizarEstado = async (req, res) => {
  try {
    // Tomamos el usuarioId de la URL
    const usuarioId = Number(req.params.usuarioId);

    // Tomamos el nuevo estado y mensaje del body
    const { estado, mensaje_estado, es_automatico } = req.body;

    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({ mensaje: 'usuario_id inválido' });
    }

    // Validación: el estado debe ser uno de los 4 válidos
    const estadosValidos = ['A salvo', 'En riesgo', 'Atrapado', 'Desaparecido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    // Buscamos el estado actual del usuario
    let estadoUsuario = await EstadoSeguridad.findOne({ usuario_id: usuarioId });

    if (estadoUsuario) {
      // Si existe, lo actualizamos
      estadoUsuario.estado = estado;
      estadoUsuario.mensaje_estado = mensaje_estado;
      if (es_automatico !== undefined) estadoUsuario.es_automatico = es_automatico;
      estadoUsuario.fecha_ultima_actualizacion = new Date();
      await estadoUsuario.save();
    } else {
      // Si no existe, lo creamos con un _id numérico nuevo
      const nuevoId = await EstadoSeguridad.countDocuments() + 1;
      estadoUsuario = new EstadoSeguridad({
        _id: nuevoId,
        usuario_id: usuarioId,
        estado: estado,
        mensaje_estado: mensaje_estado,
        es_automatico: es_automatico === undefined ? false : es_automatico,
        fecha_ultima_actualizacion: new Date()
      });
      await estadoUsuario.save();
    }

    // Respondemos
    res.status(200).json({
      mensaje: 'Estado actualizado correctamente',
      estado: estadoUsuario
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar estado',
      error: error.message
    });
  }
};

export const consultarEstado = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);

    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({ mensaje: 'usuario_id inválido' });
    }

    // Buscamos el estado del usuario
    const estado = await EstadoSeguridad.findOne({ usuario_id: usuarioId });

    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado no encontrado para ese usuario' });
    }

    res.status(200).json(estado);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar',
      error: error.message
    });
  }
};
