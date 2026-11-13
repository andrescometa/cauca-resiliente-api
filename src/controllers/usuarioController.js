import Usuario from '../models/usuario.js';
import bcrypt from 'bcryptjs';

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