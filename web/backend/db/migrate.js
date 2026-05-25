import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { getPool, isDatabaseEnabled } from './pool.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  if (!isDatabaseEnabled()) {
    console.log('DATABASE_URL not set — skipping migrations (file storage mode)');
    return false;
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf-8');
  const pool = getPool();
  await pool.query(sql);
  console.log('PostgreSQL schema applied');
  return true;
}

function isCliEntry() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isCliEntry()) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
