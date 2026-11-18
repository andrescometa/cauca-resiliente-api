import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/usuario.js';
import { ROLES, normalizarRol, esSocorrista, rolDeUsuario } from '../config/roles.js';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';

// Calcula el siguiente _id numérico libre de la colección.
const siguienteId = async (modelo) => {
  const ultimo = await modelo.findOne().sort({ _id: -1 }).lean();
  return (ultimo?._id ?? 0) + 1;
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      apellidos,
      identificacion,
      tipo_documento,
      genero,
      edad,
      ciudad,
      direccion,
      tipo_sangre,
      rol
    } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo, teléfono y contraseña son obligatorios' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const telefonoNormalizado = String(phone).trim();

    const existe = await Usuario.findOne({ email: emailNormalizado });
    if (existe) return res.status(400).json({ mensaje: 'Email ya registrado' });

    const rolId = normalizarRol(rol);
    if (rolId !== ROLES.USUARIO && rolId !== ROLES.SOCORRISTA) {
      return res.status(400).json({ mensaje: 'Rol no permitido en el registro' });
    }
    if (rolId === ROLES.SOCORRISTA && (!identificacion || !tipo_sangre)) {
      return res.status(400).json({ mensaje: 'Para registrarse como socorrista la identificación y el tipo de sangre son obligatorios' });
    }

    // "name" llega como nombre completo desde la app; separamos nombres y apellidos.
    const partes = String(name).trim().split(/\s+/).filter(Boolean);
    const nombres = partes.shift() || 'Usuario';
    // Si el usuario solo escribe un nombre, usamos el mismo como apellido para
    // no romper el campo obligatorio del esquema.
    const apellidosFinal = String(apellidos || partes.join(' ') || nombres).trim() || nombres;

    // La app puede enviar "CC - Cédula de Ciudadanía"; guardamos solo el código
    // porque el validador de la colección solo admite CC, CE, TI o PAS.
    const tipoDocCodigo = String(tipo_documento || 'CC').split('-')[0].trim().toUpperCase();
    const tipoDocValido = ['CC', 'CE', 'TI', 'PAS'].includes(tipoDocCodigo) ? tipoDocCodigo : 'CC';

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      _id: await siguienteId(Usuario),
      nombres,
      apellidos: apellidosFinal,
      identificacion: String(identificacion || telefonoNormalizado).trim(),
      tipo_documento: tipoDocValido,
      genero,
      edad,
      ciudad,
      direccion,
      tipo_sangre,
      email: emailNormalizado,
      telefono: telefonoNormalizado,
      password: passwordEncriptada,
      fecha_registro: new Date(),
      rol: rolId === ROLES.SOCORRISTA ? 'socorrista' : 'usuario',
      rol_id: rolId,
      activo: true
    });
    await nuevo.save();
    const token = jwt.sign({ id: nuevo._id, rol: rolDeUsuario(nuevo) }, SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: String(nuevo._id),
        name: nuevo.nombres,
        email: nuevo.email,
        phone: nuevo.telefono,
        rol: rolDeUsuario(nuevo)
      }
    });
  } catch (e) {
    res.status(400).json({
      mensaje: e?.name === 'ValidationError'
        ? 'Revisa los datos del registro: ' + Object.values(e.errors || {}).map((x) => x.message).join(', ')
        : 'Error al registrar',
      error: e.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalizado = String(email || '').trim().toLowerCase();
    const user = await Usuario.findOne({ email: emailNormalizado });
    if (!user) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    // Aceptamos contraseñas almacenadas como hash bcrypt y, por compatibilidad
    // con registros antiguos, también en texto plano.
    const stored = user.password || '';
    const passwordValida = /^\$2[aby]\$/.test(stored)
      ? await bcrypt.compare(password, stored)
      : stored === password;

    if (!passwordValida) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user._id, rol: rolDeUsuario(user) }, SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.nombres,
        email: user.email,
        phone: user.telefono,
        apellidos: user.apellidos ?? null,
        foto: user.foto ?? null,
        identificacion: user.identificacion ?? null,
        ciudad: user.ciudad ?? null,
        rol: rolDeUsuario(user)
      }
    });
  } catch (e) {
    res.status(500).json({ mensaje: 'Error', error: e.message });
  }
};

export const profile = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET);
    const user = await Usuario.findById(Number(decoded.id));
    if (!user) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json({
      id: String(user._id),
      name: user.nombres,
      email: user.email,
      phone: user.telefono,
      apellidos: user.apellidos ?? null,
      foto: user.foto ?? null,
      tipo_documento: user.tipo_documento ?? null,
      identificacion: user.identificacion ?? null,
      genero: user.genero ?? null,
      edad: user.edad ?? null,
      ciudad: user.ciudad ?? null,
      direccion: user.direccion ?? null,
      tipo_sangre: user.tipo_sangre ?? null,
      rol: rolDeUsuario(user),
      fecha_registro: user.fecha_registro ?? null,
      contacto_emergencia: user.contacto_emergencia ?? null
    });
  } catch (e) {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
};

// Actualiza la ubicacion actual del usuario autenticado. La app Android la
// llama desde POST /api/user/location y espera { success, user }.
export const updateLocation = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET);

    const { latitude, longitude, address } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ mensaje: 'latitude y longitude son obligatorios' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ mensaje: 'Coordenadas invalidas' });
    }

    const usuario = await Usuario.findById(Number(decoded.id));
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.ubicacion_actual = { type: 'Point', coordinates: [lng, lat] };
    if (address) usuario.direccion = address;
    await usuario.save();

    res.json({
      success: true,
      user: {
        id: String(usuario._id),
        name: usuario.nombres,
        email: usuario.email,
        phone: usuario.telefono,
        direccion: usuario.direccion ?? null
      }
    });
  } catch (e) {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
};

export { esSocorrista };
