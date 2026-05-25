import { query } from '../pool.js';

export async function findUserByUsername(username) {
  const { rows } = await query(
    'SELECT id, username, password_hash AS password FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

export async function listUsers() {
  const { rows } = await query(
    'SELECT id, username, password_hash AS password FROM users ORDER BY username'
  );
  return rows;
}

export async function createUser(username, passwordHash) {
  const { rows } = await query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return rows[0];
}
