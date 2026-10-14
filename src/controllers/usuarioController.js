// Importamos el modelo
import Usuario from '../models/usuario.js';

// ============ CREAR USUARIO ============
export const crearUsuario = async (req, res) => {
  try {
    // Tomamos los datos que vienen del body (Postman)
    const datos = req.body;

    // Validación sencilla: el tipo de sangre debe ser uno de estos
    const tiposValidos = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    if (!tiposValidos.includes(datos.tipo_sangre)) {
      return res.status(400).json({ mensaje: 'Tipo de sangre inválido' });
    }

    // Creamos el usuario y lo guardamos en MongoDB
    const nuevoUsuario = new Usuario(datos);
    await nuevoUsuario.save();

    // Respondemos 201 (creado)
    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    // Si algo falla, respondemos 400
    res.status(400).json({
      mensaje: 'Error al crear usuario',
      error: error.message
    });
  }
};

// ============ LISTAR USUARIOS ============
export const listarUsuarios = async (req, res) => {
  try {
    // Buscamos todos los usuarios
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar', error: error.message });
  }
};