import { query } from '../pool.js';

export async function listWorkspaces() {
  const { rows } = await query(
    'SELECT slug AS id, name, created_at AS "createdAt" FROM workspaces ORDER BY created_at'
  );
  return rows;
}

export async function createWorkspace(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  try {
    const { rows } = await query(
      'INSERT INTO workspaces (slug, name) VALUES ($1, $2) RETURNING slug AS id, name, created_at AS "createdAt"',
      [slug, name]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw { status: 409, message: 'Workspace already exists' };
    }
    throw err;
  }
}

export async function getWorkspaceBySlug(slug) {
  const { rows } = await query('SELECT slug, name FROM workspaces WHERE slug = $1', [slug]);
  return rows[0] || null;
}

export async function deleteWorkspace(slug) {
  await query('DELETE FROM cost_snapshots WHERE workspace_slug = $1', [slug]);
  const { rowCount } = await query('DELETE FROM workspaces WHERE slug = $1', [slug]);
  if (rowCount === 0) {
    throw { status: 404, message: 'Workspace not found' };
  }
}
