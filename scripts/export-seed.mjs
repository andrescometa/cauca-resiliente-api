import 'dotenv/config';
import mongoose from 'mongoose';
import { EJSON } from 'bson';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'seeds');
const USE_REAL_DATA = process.argv.includes('--real') || process.env.SEED_REAL === '1';
const DEMO_PASSWORD = '$2b$12$semV/D64zRHLeA0KAwsD2ucnH1L5ycB1Jjn3N96WWFPpKtdNyPGEi';
const BASE = { lat: 2.4448, lng: -76.6147 };

const jitter = (i) => [
  Number((BASE.lng + i * 0.0011).toFixed(6)),
  Number((BASE.lat + i * 0.0007).toFixed(6)),
];

const phone = (prefix, i) => `${prefix}${String(i + 1).padStart(4, '0')}`;

const anonymizers = {
  usuarios: (doc, i) => ({
    ...doc,
    nombres: 'Usuario',
    apellidos: `Demo ${i + 1}`,
    identificacion: `1000000${i + 1}`,
    telefono: phone('300000', i),
    email: `usuario${i + 1}@demo.local`,
    direccion: `Calle Demo #${i + 1}`,
    password: DEMO_PASSWORD,
    ubicacion_actual: doc.ubicacion_actual
      ? { ...doc.ubicacion_actual, coordinates: jitter(i) }
      : doc.ubicacion_actual,
    contacto_principal: doc.contacto_principal
      ? {
          ...doc.contacto_principal,
          nombre: `Contacto ${i + 1}`,
          telefono: phone('310000', i),
        }
      : doc.contacto_principal,
  }),
  contactos_emergencia: (doc, i) => ({
    ...doc,
    nombre_contacto: `Contacto ${i + 1}`,
    telefono_contacto: phone('310000', i),
  }),
  informacion_medica: (doc) => ({
    ...doc,
    eps: 'EPS Demo',
    descripcion_discapacidad: 'Ninguna',
    condiciones_cronicas: [],
    alergias_medicamentos: [],
    alergias_alimentos: [],
    medicamentos_uso: [],
  }),
  informacion_universitaria: (doc, i) => ({
    ...doc,
    codigo_estudiantil: `2026${String(i + 1).padStart(4, '0')}`,
  }),
  historial_ubicaciones: (doc, i) => ({
    ...doc,
    direccion_aproximada: 'Ubicación demo',
    coordenadas: { ...doc.coordenadas, coordinates: jitter(i) },
  }),
  solicitudes_ayuda: (doc, i) => {
    const coords = jitter(i);
    return {
      ...doc,
      descripcion_emergencia: `Emergencia de prueba ${i + 1}`,
      imagenes_adjuntas: [],
      ubicacion_solicitud: doc.ubicacion_solicitud
        ? { ...doc.ubicacion_solicitud, coordinates: coords }
        : doc.ubicacion_solicitud,
      latitud: coords[1],
      longitud: coords[0],
    };
  },
  asignacion_rescate: (doc, i) => ({
    ...doc,
    observaciones: `Observación demo ${i + 1}`,
  }),
  estados_seguridad: (doc, i) => ({
    ...doc,
    mensaje_estado: `Estado de prueba ${i + 1}`,
  }),
  alertas: (doc, i) => ({
    ...doc,
    mensaje: `Alerta de prueba ${i + 1}`,
  }),
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const collections = (await mongoose.connection.db.listCollections().toArray())
    .map((c) => c.name)
    .sort();

  for (const name of collections) {
    const docs = await mongoose.connection.db.collection(name).find().toArray();
    const anonymize = anonymizers[name];
    const output = docs.map((doc, i) => (anonymize && !USE_REAL_DATA ? anonymize(doc, i) : doc));
    const json = EJSON.stringify(output, null, 2, { relaxed: false });
    await fs.writeFile(path.join(OUT_DIR, `${name}.json`), `${json}\n`);
    console.log(`✓ ${name}: ${output.length} documentos`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Error exportando seed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
