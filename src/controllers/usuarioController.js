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
    
    const ultimoUsuarioValido = await Usuario.findOne({ _id: { $type: 'number' } }).sort({ _id: -1 });
    const nuevoId = ultimoUsuarioValido ? ultimoUsuarioValido._id + 1 : 1;

    const nuevoUsuario = new Usuario({
      _id: nuevoId,
      nombres,
      apellidos,
      tipo_documento,
      identificacion,
      email,
      password: passwordEncriptada, 
      telefono,
      departamento_id: Number(departamento_id), // Forzamos la conversión a Número aquí
      municipio_id: Number(municipio_id),       // Forzamos la conversión a Número aquí
      direccion: req.body.direccion || 'No especificada',
      tipo_sangre: req.body.tipo_sangre || 'No registra',
      alergias: req.body.alergias || [],
      discapacidades: req.body.discapacidades || [],
      contacto_emergencia: req.body.contacto_emergencia || {},
      rol_id: Number(rol_id) || 1,
      fecha_registro: new Date(),
      activo: true
    });

    await nuevoUsuario.save();

    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente', 
      usuario: usuarioRespuesta 
    });
  } catch (error) {
    console.error("ERROR EN REGISTRO:", error);
    res.status(400).json({ mensaje: 'Error al registrar', error: error.message });
  }
};

// ... (El resto del archivo de login, listar, etc., se mantiene igual)
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: 'Ingresa correo y contraseña' });
    
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;
    usuarioSinPassword.rol_id = Number(usuarioSinPassword.rol_id);

    res.status(200).json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};

export const ObtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.usuarioId).select('-password');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar', error: error.message });
  }
};

export const actualizarRolUsuario = async (req, res) => {
  try {
    const { rol_id } = req.body; 
    if (![1, 2, 3, 4].includes(Number(rol_id))) return res.status(400).json({ mensaje: 'Rol inválido' });
    
    const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, { rol_id: Number(rol_id) }, { returnDocument: 'after' }).select('-password');
    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    res.status(200).json({ mensaje: 'Rol actualizado', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rol', error: error.message });
  }
};

export const actualizarEstadoOperativo = async (req, res) => {
  try {
    const { estado_operativo } = req.body; 
    const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, { estado_operativo }, { returnDocument: 'after' }).select('-password');
    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ mensaje: 'Estado actualizado', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
};

