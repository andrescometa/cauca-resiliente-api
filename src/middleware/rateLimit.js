// Limitador de intentos en memoria (sin dependencias externas), suficiente
// para una sola instancia. Protege los endpoints de login contra fuerza bruta.
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 30;
const intentos = new Map();

const limpiar = () => {
  if (intentos.size < 5000) return;
  const ahora = Date.now();
  for (const [clave, registro] of intentos) {
    if (ahora - registro.inicio > VENTANA_MS) intentos.delete(clave);
  }
};

export const limitarLogin = (req, res, next) => {
  limpiar();

  const clave = req.ip || req.socket?.remoteAddress || 'desconocido';
  const ahora = Date.now();
  const registro = intentos.get(clave);

  if (!registro || ahora - registro.inicio > VENTANA_MS) {
    intentos.set(clave, { inicio: ahora, cuenta: 1 });
    return next();
  }

  registro.cuenta += 1;
  if (registro.cuenta > MAX_INTENTOS) {
    return res.status(429).json({
      mensaje: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en unos minutos.'
    });
  }

  return next();
};
