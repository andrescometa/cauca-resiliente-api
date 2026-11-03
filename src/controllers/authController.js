import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Usuario from '../models/usuario.js';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';

// Rol "Estudiante" (ciudadano) por defecto para los registros desde la app.
const ROL_ESTUDIANTE_ID = new mongoose.Types.ObjectId('650000000000000000000001');

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, apellidos, identificacion, tipo_documento } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo, teléfono y contraseña son obligatorios' });
    }
    const exists = await Usuario.findOne({ email });
    if (exists) return res.status(400).json({ mensaje: 'Email ya registrado' });

    // "name" llega como nombre completo desde la app; separamos nombres y apellidos.
    const partes = String(name).trim().split(/\s+/);
    const nombres = partes.shift() || '';
    const apellidosFinal = apellidos || partes.join(' ');

    const nuevo = new Usuario({
      nombres,
      apellidos: apellidosFinal,
      identificacion: identificacion || phone,
      tipo_documento: tipo_documento || 'CC',
      email,
      telefono: phone,
      password,
      fecha_registro: new Date(),
      rol: 'usuario',
      rol_id: ROL_ESTUDIANTE_ID,
      activo: true
    });
    await nuevo.save();
    const token = jwt.sign({ id: nuevo._id }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: String(nuevo._id), name: nuevo.nombres, email: nuevo.email, phone: nuevo.telefono } });
  } catch (e) {
    res.status(400).json({ mensaje: 'Error al registrar', error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: String(user._id), name: user.nombres, email: user.email, phone: user.telefono } });
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
      rol: user.rol ?? null,
      fecha_registro: user.fecha_registro ?? null,
      contacto_emergencia: user.contacto_emergencia ?? null
    });
  } catch (e) {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
};
