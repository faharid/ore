import pg from 'pg';

const { Pool } = pg;

let pool = null;

export function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!isDatabaseEnabled()) {
    throw new Error('DATABASE_URL is not configured');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err.message);
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const p = getPool();
  return p.query(text, params);
}

export async function checkDatabaseHealth() {
  if (!isDatabaseEnabled()) return { ok: false, mode: 'file' };
  try {
    await query('SELECT 1');
    return { ok: true, mode: 'postgres' };
  } catch (err) {
    return { ok: false, mode: 'postgres', error: err.message };
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
