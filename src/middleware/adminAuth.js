import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js';
import { esAdmin } from '../config/roles.js';

const SECRET = process.env.JWT_SECRET || 'cauca_secret';

export const requiereAdmin = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return res.status(401).json({ mensaje: 'Token de administrador requerido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const usuario = await Usuario.findById(Number(decoded.id));
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
    if (!esAdmin(usuario)) {
      return res.status(403).json({ mensaje: 'Se requieren permisos de administrador' });
    }
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};
