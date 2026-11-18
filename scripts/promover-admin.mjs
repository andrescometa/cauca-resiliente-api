import 'dotenv/config';
import mongoose from 'mongoose';
import conectarDB from '../src/config/db.js';
import Usuario from '../src/models/usuario.js';
import { ROLES } from '../src/config/roles.js';

const email = String(process.argv[2] || '').trim().toLowerCase();

if (!email) {
  console.error('Uso: npm run admin:promover -- correo@ejemplo.com');
  process.exit(1);
}

await conectarDB();

const usuario = await Usuario.findOne({ email });

if (!usuario) {
  console.error(`No existe un usuario con el correo ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

usuario.rol_id = ROLES.ADMIN;
usuario.rol = 'admin';
await usuario.save();

console.log(`✅ ${usuario.nombres} ${usuario.apellidos} (${usuario.email}) ahora es administrador.`);
await mongoose.disconnect();
