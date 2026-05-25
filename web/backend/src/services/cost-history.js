import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { estimateCost } from './cost-estimator.js';
import { isDatabaseEnabled } from '../../db/pool.js';
import * as costRepo from '../../db/repositories/cost-history.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE =
  process.env.COST_HISTORY_FILE || path.join(__dirname, '../../data/cost-history.json');

async function ensureFile() {
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
    await fs.writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
  }
}

async function getCostHistoryFromFile() {
  await ensureFile();
  const content = await fs.readFile(HISTORY_FILE, 'utf-8');
  return JSON.parse(content);
}

export async function appendCostSnapshot(env, workspace, config) {
  const estimate = estimateCost(config);
  const entry = {
    env,
    workspace: workspace || 'default',
    timestamp: new Date().toISOString(),
    ...estimate
  };

  if (isDatabaseEnabled()) {
    await costRepo.insertCostSnapshot(entry);
    await costRepo.pruneCostHistory(500);
    return entry;
  }

  await ensureFile();
  const content = await fs.readFile(HISTORY_FILE, 'utf-8');
  const history = JSON.parse(content);
  history.push(entry);
  if (history.length > 500) history.splice(0, history.length - 500);
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  return entry;
}

export async function getCostHistory() {
  if (isDatabaseEnabled()) {
    return costRepo.listCostHistory();
  }
  return getCostHistoryFromFile();
}
