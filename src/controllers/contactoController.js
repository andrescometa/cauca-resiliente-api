import ContactoEmergencia from '../models/ContactoEmergencia.js';
import { siguienteId } from '../utils/ids.js';

const MAX_CONTACTOS = 5;

const siguienteIdContacto = () => siguienteId(ContactoEmergencia);

const normalizarTelefono = (telefono) => String(telefono || '').replace(/[^0-9+]/g, '');

const validarDatos = ({ nombre_contacto, telefono_contacto, parentesco }) => {
  const nombre = String(nombre_contacto || '').trim();
  const telefono = normalizarTelefono(telefono_contacto);

  if (nombre.length < 3) return 'El nombre del contacto es obligatorio';
  if (telefono.replace(/\+/g, '').length < 7) return 'El teléfono del contacto no es válido';
  if (parentesco != null && String(parentesco).length > 60) return 'El parentesco es demasiado largo';

  return null;
};

export const getContactosPorUsuario = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);

    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({ mensaje: 'usuarioId inválido' });
    }

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

export const crearContacto = async (req, res) => {
  try {
    const {
      usuario_id,
      nombre_contacto,
      telefono_contacto,
      parentesco,
      prioridad
    } = req.body;

    const usuarioId = Number(usuario_id);
    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({ mensaje: 'usuario_id inválido' });
    }

    const error = validarDatos({ nombre_contacto, telefono_contacto, parentesco });
    if (error) return res.status(400).json({ mensaje: error });

    const total = await ContactoEmergencia.countDocuments({ usuario_id: usuarioId });
    if (total >= MAX_CONTACTOS) {
      return res.status(400).json({ mensaje: `Puedes vincular máximo ${MAX_CONTACTOS} contactos` });
    }

    const prioridadFinal = Number.isInteger(Number(prioridad)) && Number(prioridad) > 0
      ? Number(prioridad)
      : total + 1;

    const nuevo = new ContactoEmergencia({
      _id: await siguienteIdContacto(),
      usuario_id: usuarioId,
      nombre_contacto: String(nombre_contacto).trim(),
      telefono_contacto: normalizarTelefono(telefono_contacto),
      parentesco: String(parentesco || '').trim() || null,
      prioridad: prioridadFinal,
      notificado: false
    });

    await nuevo.save();

    res.status(201).json({ mensaje: 'Contacto vinculado correctamente', contacto: nuevo });
  } catch (error) {
    res.status(400).json({ mensaje: 'No se pudo vincular el contacto', error: error.message });
  }
};

export const actualizarContacto = async (req, res) => {
  try {
    const contactoId = Number(req.params.id);
    if (!Number.isInteger(contactoId)) {
      return res.status(400).json({ mensaje: 'Contacto inválido' });
    }

    const { usuario_id, nombre_contacto, telefono_contacto, parentesco, prioridad } = req.body;
    const usuarioId = Number(usuario_id);

    const contacto = await ContactoEmergencia.findById(contactoId);
    if (!contacto) return res.status(404).json({ mensaje: 'Contacto no encontrado' });
    if (Number.isInteger(usuarioId) && contacto.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No puedes modificar este contacto' });
    }

    const error = validarDatos({ nombre_contacto, telefono_contacto, parentesco });
    if (error) return res.status(400).json({ mensaje: error });

    contacto.nombre_contacto = String(nombre_contacto).trim();
    contacto.telefono_contacto = normalizarTelefono(telefono_contacto);
    contacto.parentesco = String(parentesco || '').trim() || null;
    if (Number.isInteger(Number(prioridad)) && Number(prioridad) > 0) {
      contacto.prioridad = Number(prioridad);
    }
    await contacto.save();

    res.status(200).json({ mensaje: 'Contacto actualizado', contacto });
  } catch (error) {
    res.status(400).json({ mensaje: 'No se pudo actualizar el contacto', error: error.message });
  }
};

export const eliminarContacto = async (req, res) => {
  try {
    const contactoId = Number(req.params.id);
    const usuarioId = Number(req.query.usuario_id ?? req.body?.usuario_id);

    if (!Number.isInteger(contactoId)) {
      return res.status(400).json({ mensaje: 'Contacto inválido' });
    }

    const contacto = await ContactoEmergencia.findById(contactoId);
    if (!contacto) return res.status(404).json({ mensaje: 'Contacto no encontrado' });
    if (Number.isInteger(usuarioId) && contacto.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No puedes eliminar este contacto' });
    }

    await contacto.deleteOne();
    res.status(200).json({ mensaje: 'Contacto eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo eliminar el contacto', error: error.message });
  }
};
