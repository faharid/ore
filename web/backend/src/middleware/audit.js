import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isDatabaseEnabled } from '../../db/pool.js';
import * as auditRepo from '../../db/repositories/audit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_LOG = process.env.AUDIT_LOG_PATH || path.join(__dirname, '../../data/audit.log');

async function logAuditEventToFile(event) {
  await fs.mkdir(path.dirname(AUDIT_LOG), { recursive: true });
  const line = JSON.stringify({
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  });
  await fs.appendFile(AUDIT_LOG, line + '\n', 'utf-8');
}

export async function logAuditEvent(event) {
  try {
    if (isDatabaseEnabled()) {
      await auditRepo.insertAuditEvent(event);
      return;
    }
    await logAuditEventToFile(event);
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

export function auditMiddleware(req, res, next) {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return next();

  res.on('finish', () => {
    if (res.statusCode < 400) {
      logAuditEvent({
        user: req.user?.username || 'anonymous',
        action: req.method,
        resource: req.originalUrl,
        workspace: req.workspace,
        status: res.statusCode
      });
    }
  });
  next();
}
