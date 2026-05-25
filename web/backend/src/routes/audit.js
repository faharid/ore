import express from 'express';
import { isDatabaseEnabled } from '../../db/pool.js';
import * as auditRepo from '../../db/repositories/audit.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (!isDatabaseEnabled()) {
      return res.status(503).json({
        message: 'Audit API requires DATABASE_URL (PostgreSQL)'
      });
    }
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const workspace = req.query.workspace;
    const events = await auditRepo.listAuditEvents({ limit, workspace });
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

export default router;
