import 'dotenv/config';
import conectarDB from './src/config/db.js';
import { consultarSismosRecientes } from './src/workers/UsgsWorker.js';

await conectarDB();
await consultarSismosRecientes();
process.exit(0);