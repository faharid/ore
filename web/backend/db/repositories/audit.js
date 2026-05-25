import { query } from '../pool.js';

export async function insertAuditEvent(event) {
  await query(
    `INSERT INTO audit_events (username, action, resource, workspace_slug, status_code, payload)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.user || event.username || null,
      event.action,
      event.resource,
      event.workspace || event.workspace_slug || null,
      event.status || event.status_code || null,
      event.changes ? JSON.stringify(event.changes) : null
    ]
  );
}

export async function listAuditEvents({ limit = 100, workspace } = {}) {
  if (workspace) {
    const { rows } = await query(
      `SELECT username, action, resource, workspace_slug AS workspace, status_code AS status, created_at AS timestamp
       FROM audit_events WHERE workspace_slug = $1 ORDER BY created_at DESC LIMIT $2`,
      [workspace, limit]
    );
    return rows;
  }
  const { rows } = await query(
    `SELECT username, action, resource, workspace_slug AS workspace, status_code AS status, created_at AS timestamp
     FROM audit_events ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}
