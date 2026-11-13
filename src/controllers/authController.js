import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Usuario from '../models/usuario.js';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';

// Roles disponibles en la app.
const ROLES = {
  usuario: {
    nombre: 'usuario',
    id: new mongoose.Types.ObjectId('650000000000000000000001')
  },
  socorrista: {
    nombre: 'socorrista',
    id: new mongoose.Types.ObjectId('650000000000000000000002')
  }
};

const ROL_SOCORRISTA_ID = ROLES.socorrista.id.toString();

const normalizarRol = (rol) => {
  const valor = String(rol || '').trim().toLowerCase();
  return valor === 'socorrista' ? ROLES.socorrista : ROLES.usuario;
};

// Los usuarios antiguos solo tienen rol_id, por eso resolvemos el rol
// tanto por el campo "rol" como por el identificador del rol.
const esSocorrista = (usuario) => {
  const rol = String(usuario?.rol || '').trim().toLowerCase();
  if (rol === 'socorrista') return true;
  return String(usuario?.rol_id || '') === ROL_SOCORRISTA_ID;
};

const rolDeUsuario = (usuario) => (esSocorrista(usuario) ? 'socorrista' : 'usuario');

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
    const exists = await Usuario.findOne({ email });
    if (exists) return res.status(400).json({ mensaje: 'Email ya registrado' });

    const rolFinal = normalizarRol(rol);
    if (rolFinal.nombre === 'socorrista' && (!identificacion || !tipo_sangre)) {
      return res.status(400).json({ mensaje: 'Para registrarse como socorrista la identificación y el tipo de sangre son obligatorios' });
    }

    // "name" llega como nombre completo desde la app; separamos nombres y apellidos.
    const partes = String(name).trim().split(/\s+/);
    const nombres = partes.shift() || '';
    const apellidosFinal = apellidos || partes.join(' ');

    const nuevo = new Usuario({
      nombres,
      apellidos: apellidosFinal,
      identificacion: identificacion || phone,
      tipo_documento: tipo_documento || 'CC',
      genero,
      edad,
      ciudad,
      direccion,
      tipo_sangre,
      email,
      telefono: phone,
      password,
      fecha_registro: new Date(),
      rol: rolFinal.nombre,
      rol_id: rolFinal.id,
      activo: true
    });
    await nuevo.save();
    const token = jwt.sign({ id: nuevo._id, rol: rolFinal.nombre }, SECRET, { expiresIn: '7d' });
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
    res.status(400).json({ mensaje: 'Error al registrar', error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, rol: rolDeUsuario(user) }, SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.nombres,
        email: user.email,
        phone: user.telefono,
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
    const user = await Usuario.findById(decoded.id);
    if (!user) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json({
      id: String(user._id),
      name: user.nombres,
      email: user.email,
      phone: user.telefono,
      apellidos: user.apellidos ?? null,
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
