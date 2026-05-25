import express from 'express';
import { getOutputs, getPlan, streamTerraform, ensureTerraformInit } from '../services/terraform.js';
import * as configService from '../services/config.js';

const router = express.Router();

function sendSSEEvent(res, type, message) {
  res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
}

function setupSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

async function runStreamedTerraform(req, res, args, infoMessage) {
  const { env } = req.params;

  await configService.readConfig(env, req.workspace || 'default');

  setupSSE(res);
  sendSSEEvent(res, 'info', infoMessage);

  try {
    await ensureTerraformInit();
    const success = await streamTerraform(args, {}, (event) => {
      sendSSEEvent(res, event.type, event.message);
    });

    if (!success) {
      sendSSEEvent(res, 'error', 'Command failed — see output above');
    }
  } catch (err) {
    sendSSEEvent(res, 'error', err.message || 'Terraform error');
  }

  res.end();
}

router.post('/:env/plan', async (req, res) => {
  const { env } = req.params;
  const args = [
    'plan',
    `-var-file=environments/${req.workspace && req.workspace !== 'default' ? `${req.workspace}/` : ''}${env}.tfvars`,
    '-out=tfplan',
    '-no-color'
  ];
  await runStreamedTerraform(req, res, args, `Planning infrastructure for environment: ${env}`);
});

router.post('/:env/apply', async (req, res) => {
  const { env } = req.params;
  const { autoApprove = false } = req.body;
  const wsPrefix = req.workspace && req.workspace !== 'default' ? `${req.workspace}/` : '';
  const args = autoApprove
    ? ['apply', '-auto-approve', '-no-color', `-var-file=environments/${wsPrefix}${env}.tfvars`]
    : ['apply', '-no-color', `-var-file=environments/${wsPrefix}${env}.tfvars`, 'tfplan'];

  await runStreamedTerraform(req, res, args, `Applying infrastructure for environment: ${env}`);
});

router.post('/:env/destroy', async (req, res) => {
  const { env } = req.params;
  const { autoApprove = false } = req.body;
  const wsPrefix = req.workspace && req.workspace !== 'default' ? `${req.workspace}/` : '';
  const args = [
    'destroy',
    autoApprove ? '-auto-approve' : '-no-color',
    `-var-file=environments/${wsPrefix}${env}.tfvars`
  ];

  setupSSE(res);
  sendSSEEvent(res, 'warn', `Warning: This will destroy all infrastructure in environment: ${env}`);
  sendSSEEvent(res, 'info', `Destroying infrastructure for environment: ${env}`);

  try {
    await ensureTerraformInit();
    await streamTerraform(args, {}, (event) => sendSSEEvent(res, event.type, event.message));
  } catch (err) {
    sendSSEEvent(res, 'error', err.message);
  }
  res.end();
});

router.get('/:env/outputs', async (req, res, next) => {
  try {
    const { env } = req.params;
    await configService.readConfig(env, req.workspace || 'default');
    const outputs = await getOutputs();
    res.json(outputs);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to get outputs' });
  }
});

router.get('/:env/plan', async (req, res) => {
  try {
    const plan = await getPlan();
    if (!plan) {
      return res.status(404).json({ message: 'No plan found. Run plan first.' });
    }
    res.json(plan);
  } catch {
    res.status(500).json({ message: 'Failed to read plan' });
  }
});

export default router;
