import express from 'express';
import crypto from 'crypto';
import * as configService from '../services/config.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = express.Router();

function verifyGithubSignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true;

  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  if (sig.length !== digest.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

router.post('/github', async (req, res) => {
  if (!verifyGithubSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const { action, pull_request, repository } = req.body || {};

  await logAuditEvent({
    user: 'github-webhook',
    action: event,
    resource: repository?.full_name || 'unknown',
    changes: { action, pr: pull_request?.number }
  });

  if (event === 'pull_request' && action === 'opened' && pull_request) {
    const envName = `pr-${pull_request.number}`;
    try {
      await configService.writeConfig(envName, {
        project_name: 'ore',
        environment: envName,
        aws_region: 'us-east-1'
      });
      return res.json({
        message: `Environment ${envName} scaffolded for PR #${pull_request.number}`,
        hint: 'Run plan from ore UI or CI'
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.json({ received: true, event, action });
});

export default router;
