import ContactoEmergencia from '../models/ContactoEmergencia.js';

export const getContactosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const contactos = await ContactoEmergencia
      .find({ usuario_id: usuarioId })
      .sort({ prioridad: 1 });

    res.status(200).json({
      mensaje: 'Contactos de emergencia',
      total: contactos.length,
      contactos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los contactos de emergencia',
      error: error.message
    });
  }
};
