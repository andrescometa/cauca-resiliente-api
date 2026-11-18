import 'dotenv/config';
import conectarDB from './src/config/db.js';
import { consultarAlertasDefensoria } from './src/workers/defensoria.worker.js';

await conectarDB();
await consultarAlertasDefensoria();
process.exit(0);