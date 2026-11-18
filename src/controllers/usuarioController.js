import Usuario from '../models/usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config/env.js';
import { siguienteId } from '../utils/ids.js';

const SECRET = JWT_SECRET;

// Roles que un cliente puede elegir al registrarse. Los roles 3, 4 y 5 son
// administrativos y solo se asignan con el endpoint protegido /:id/rol.
const ROLES_PUBLICOS = new Set([1, 2]);

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
    const { email, password } = req.body || {};
    const correoNormalizado = String(email || '').trim().toLowerCase();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correoNormalizado)) {
      return res.status(400).json({ mensaje: 'El correo electrónico no es válido' });
    }
    if (!password) {
      return res.status(400).json({ mensaje: 'La contraseña es obligatoria' });
    }

    const usuarioExiste = await Usuario.findOne({ email: correoNormalizado });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // Solo copiamos campos de perfil permitidos: antes se hacía ...req.body y
    // un cliente podía enviar rol_id: 5 (admin) o activo: false.
    const CAMPOS_PERMITIDOS = [
      'nombres', 'apellidos', 'tipo_documento', 'identificacion', 'genero',
      'edad', 'telefono', 'ciudad', 'direccion', 'tipo_sangre', 'alergias',
      'discapacidades', 'contacto_emergencia', 'foto'
    ];
    const datos = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
    }

    const rolSolicitado = Number(req.body.rol_id);
    const rolId = ROLES_PUBLICOS.has(rolSolicitado) ? rolSolicitado : 1;

    const nuevoUsuario = new Usuario({
      ...datos,
      _id: await siguienteId(Usuario),
      email: correoNormalizado,
      password: passwordEncriptada,
      rol_id: rolId,
      rol: rolId === 2 ? 'socorrista' : 'usuario',
      activo: true,
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
    const correoNormalizado = String(email || '').trim().toLowerCase();
    const usuario = await Usuario.findOne({ email: correoNormalizado }).select('+password');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    const stored = usuario.password || '';
    const passwordValida = /^\$2[aby]\$/.test(stored)
      ? await bcrypt.compare(password, stored)
      : stored === password;
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
    const rolId = Number(rol_id);
    if (![1, 2, 3, 4, 5].includes(rolId)) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }
    // Mantenemos sincronizados rol_id y el campo de texto "rol" que usan los
    // helpers esAdmin()/esSocorrista().
    const NOMBRES = { 1: 'usuario', 2: 'socorrista', 3: 'admin_refugio', 4: 'centro_control', 5: 'admin' };
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { rol_id: rolId, rol: NOMBRES[rolId] },
      { returnDocument: 'after' }
    );
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
      { returnDocument: 'after' }
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
      const usuario = await Usuario.findByIdAndUpdate(usuarioId, { foto: null }, { returnDocument: 'after' });
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

    const usuario = await Usuario.findByIdAndUpdate(usuarioId, { foto }, { returnDocument: 'after' });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({
      mensaje: 'Foto actualizada correctamente',
      usuario: perfilPublico(usuario)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la foto', error: error.message });
  }
};
