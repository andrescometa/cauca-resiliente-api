import Usuario from '../models/usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';

// Devuelve el usuario autenticado del token o null si el token no es válido.
const usuarioDesdeToken = (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token || token === auth) return null;

  try {
    const decoded = jwt.verify(token, SECRET);
    return Number(decoded.id);
  } catch {
    return null;
  }
};

// Formatea el usuario con la misma estructura que devuelve /api/user/profile.
const perfilPublico = (usuario) => ({
  id: String(usuario._id),
  name: usuario.nombres,
  apellidos: usuario.apellidos ?? null,
  email: usuario.email,
  phone: usuario.telefono ?? null,
  foto: usuario.foto ?? null,
  tipo_documento: usuario.tipo_documento ?? null,
  identificacion: usuario.identificacion ?? null,
  genero: usuario.genero ?? null,
  edad: usuario.edad ?? null,
  ciudad: usuario.ciudad ?? null,
  direccion: usuario.direccion ?? null,
  tipo_sangre: usuario.tipo_sangre ?? null,
  rol: usuario.rol ?? null,
  fecha_registro: usuario.fecha_registro ?? null,
  contacto_emergencia: usuario.contacto_emergencia ?? null
});

// ============ REGISTRAR USUARIO ============
export const registrarUsuario = async (req, res) => {
  try {
    const { email, password, nombres, apellidos, identificacion } = req.body;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return res.status(400).json({ mensaje: 'El correo electrónico no es válido' });
    }
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);
    // Generamos un _id numérico libre
    const ultimoUsuario = await Usuario.findOne().sort({ _id: -1 }).lean();
    
    const nuevoUsuario = new Usuario({
      ...req.body,
      _id: (ultimoUsuario?._id ?? 0) + 1, 
      password: passwordEncriptada, 
      fecha_registro: new Date()
    });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: { _id: nuevoUsuario._id, nombres: nuevoUsuario.nombres, rol_id: nuevoUsuario.rol_id } });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al registrar', error: error.message });
  }
};

// ============ LOGIN ============
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;
    res.status(200).json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ============ LISTAR USUARIOS ============
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

// ========== OBTENER USUARIO ==========
export const ObtenerUsuario = async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

// ============ ACTUALIZAR ROL ============
export const actualizarRolUsuario = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const { rol_id } = req.body; 
    if (![1, 2, 3, 4, 5].includes(rol_id)) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }
    const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, { rol_id: rol_id }, { new: true });
    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ mensaje: 'Rol actualizado correctamente', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rol', error: error.message });
  }
};

// ============ ACTUALIZAR ESTADO OPERATIVO ============
export const actualizarEstadoOperativo = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const { estado_operativo } = req.body; 

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId, 
      { estado_operativo: estado_operativo }, 
      { new: true }
    );

    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    res.status(200).json({ mensaje: 'Estado operativo actualizado', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
};

// ============ ACTUALIZAR PERFIL (nombre, teléfono, correo) ============
export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const usuarioAutenticado = usuarioDesdeToken(req);
    if (!usuarioAutenticado) return res.status(401).json({ mensaje: 'No autorizado' });
    if (usuarioAutenticado !== usuarioId) {
      return res.status(403).json({ mensaje: 'Solo puedes editar tu propio perfil' });
    }

    const { nombres, apellidos, telefono, email, direccion, ciudad } = req.body;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (nombres !== undefined) {
      const nombresLimpios = String(nombres).trim();
      if (nombresLimpios.length < 2) {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
      }
      usuario.nombres = nombresLimpios;
    }

    if (apellidos !== undefined) {
      usuario.apellidos = String(apellidos).trim();
    }

    if (telefono !== undefined) {
      const telefonoLimpio = String(telefono).trim();
      if (telefonoLimpio && !/^[0-9+\s-]{7,20}$/.test(telefonoLimpio)) {
        return res.status(400).json({ mensaje: 'El número de teléfono no es válido' });
      }
      usuario.telefono = telefonoLimpio;
    }

    if (email !== undefined) {
      const correoLimpio = String(email).trim().toLowerCase();
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(correoLimpio)) {
        return res.status(400).json({ mensaje: 'El correo electrónico no es válido' });
      }
      const otroUsuario = await Usuario.findOne({ email: correoLimpio, _id: { $ne: usuarioId } });
      if (otroUsuario) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }
      usuario.email = correoLimpio;
    }

    if (direccion !== undefined) usuario.direccion = String(direccion).trim();
    if (ciudad !== undefined) usuario.ciudad = String(ciudad).trim();

    await usuario.save();

    res.status(200).json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: perfilPublico(usuario)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el perfil', error: error.message });
  }
};

// ============ ACTUALIZAR FOTO DE PERFIL ============
export const actualizarFoto = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const usuarioAutenticado = usuarioDesdeToken(req);
    if (!usuarioAutenticado) return res.status(401).json({ mensaje: 'No autorizado' });
    if (usuarioAutenticado !== usuarioId) {
      return res.status(403).json({ mensaje: 'Solo puedes editar tu propio perfil' });
    }

    const { foto } = req.body;

    if (foto === null || foto === '') {
      // Se permite quitar la foto de perfil.
      const usuario = await Usuario.findByIdAndUpdate(usuarioId, { foto: null }, { new: true });
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return res.status(200).json({
        mensaje: 'Foto eliminada correctamente',
        usuario: perfilPublico(usuario)
      });
    }

    if (typeof foto !== 'string' || !foto.startsWith('data:image/')) {
      return res.status(400).json({ mensaje: 'La foto debe enviarse como imagen en base64' });
    }

    const base64 = foto.split(',')[1] || '';
    // 2 MB de base64 ≈ 1.5 MB de imagen.
    if (base64.length > 2_800_000) {
      return res.status(400).json({ mensaje: 'La foto es demasiado grande, máximo 2 MB' });
    }

    const usuario = await Usuario.findByIdAndUpdate(usuarioId, { foto }, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({
      mensaje: 'Foto actualizada correctamente',
      usuario: perfilPublico(usuario)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la foto', error: error.message });
  }
};
