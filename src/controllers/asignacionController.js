import Asignacion from '../models/Asignacion.js';
import Solicitud from '../models/Solicitud.js';

export const crearAsignacion = async (req, res) => {
  try {
    // Tomamos los datos del socoorrista a quie se le va a asiganar la solicitud
    const { solicitud_id, socorrista_id } = req.body;

    // Validación 1: campos obligatorios
    if (!solicitud_id || !socorrista_id) {
      return res.status(400).json({ mensaje: 'Faltan datos (solicitud_id, socorrista_id)' });
    }

    // Validación 2: la solicitud debe existir
    const solicitud = await Solicitud.findById(solicitud_id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'La solicitud no existe' });
    }

    // Validación 3: la solicitud no debe tener ya una asignación activa
    const existente = await Asignacion.findOne({ 
      solicitud_id, 
      estado_atencion: { $ne: 'Finalizado' }  // $ne = "no es igual a"
    });
    if (existente) {
      return res.status(400).json({ mensaje: 'La solicitud ya tiene una asignación activa' });
    }

    // Generamos nuevo _id
    const total = await Asignacion.countDocuments();
    const nuevoId = total + 1;

    // Creamos la asignación
    const nuevaAsignacion = new Asignacion({
      _id: nuevoId,
      solicitud_id,
      socorrista_id,
      estado_atencion: 'En camino',        // Estado inicial
      fecha_asignacion: new Date()
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


export const actualizarAsignacion = async (req, res) => {
  try {
    // Tomamos el id de la URL
    const id = Number(req.params.id);

    // Tomamos el nuevo estado del body
    const { estado_atencion } = req.body;

    // Validación: el estado debe ser uno de los 3 válidos
    const estadosValidos = ['En camino', 'En el sitio', 'Finalizado'];
    if (!estadosValidos.includes(estado_atencion)) {
      return res.status(400).json({ mensaje: 'Estado de atención inválido' });
    }

    // Buscamos la asignación
    const asignacion = await Asignacion.findById(id);
    if (!asignacion) {
      return res.status(404).json({ mensaje: 'Asignación no encontrada' });
    }

    // Actualizamos
    asignacion.estado_atencion = estado_atencion;
    await asignacion.save();

    // Si se finaliza, también actualizamos el estado de la solicitud
    if (estado_atencion === 'Finalizado') {
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