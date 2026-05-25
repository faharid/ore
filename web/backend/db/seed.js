import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { isDatabaseEnabled, query } from './pool.js';

dotenv.config();

const DEFAULT_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

export async function runSeed() {
  if (!isDatabaseEnabled()) {
    console.log('DATABASE_URL not set — skipping seed');
    return false;
  }

  const { rows: wsRows } = await query('SELECT slug FROM workspaces WHERE slug = $1', ['default']);
  if (wsRows.length === 0) {
    await query('INSERT INTO workspaces (slug, name) VALUES ($1, $2)', ['default', 'Default']);
    console.log('Seeded workspace: default');
  }

  const { rows: userRows } = await query('SELECT id FROM users LIMIT 1');
  if (userRows.length === 0) {
    const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [
      'admin',
      hash
    ]);
    console.log(`Seeded user: admin (password: ${DEFAULT_ADMIN_PASSWORD})`);
  }

  return true;
}

function isCliEntry() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isCliEntry()) {
  import('./migrate.js')
    .then(({ runMigrations }) => runMigrations().then(() => runSeed()))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
