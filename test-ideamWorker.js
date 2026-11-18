import 'dotenv/config';
import conectarDB from './src/config/db.js';
import { consultarAlertasIdeam } from './src/workers/ideam-worker.js';

await conectarDB();
await consultarAlertasIdeam();
process.exit(0);