import 'dotenv/config';
import mongoose from 'mongoose';
import { EJSON } from 'bson';
import fs from 'node:fs/promises';
import path from 'node:path';
import conectarDB from './config/db.js';

const SEEDS_DIR = path.resolve(process.cwd(), 'seeds');

const main = async () => {
  await conectarDB();

  const files = (await fs.readdir(SEEDS_DIR))
    .filter((file) => file.endsWith('.json'))
    .sort();

  for (const file of files) {
    const collection = path.basename(file, '.json');
    const raw = await fs.readFile(path.join(SEEDS_DIR, file), 'utf8');
    const docs = EJSON.parse(raw);
    const target = mongoose.connection.db.collection(collection);

    await target.deleteMany({});
    if (docs.length > 0) {
      await target.insertMany(docs);
    }

    console.log(`✓ ${collection}: ${docs.length} documentos`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Error ejecutando el seed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
