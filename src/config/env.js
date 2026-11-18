// Secreto JWT centralizado.
// En producción es obligatorio: con el valor por defecto ('cauca_secret')
// cualquiera podría firmar tokens válidos.
const secreto = process.env.JWT_SECRET;

if (!secreto && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET es obligatorio en producción. Defínelo en las variables de entorno.');
  process.exit(1);
}

if (!secreto) {
  console.warn('⚠️  JWT_SECRET no está definido: usando el valor de desarrollo "cauca_secret".');
}

const JWT_SECRET = secreto || 'cauca_secret';

export default JWT_SECRET;
