import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isDatabaseEnabled } from '../../db/pool.js';
import * as workspacesRepo from '../../db/repositories/workspaces.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACES_FILE =
  process.env.WORKSPACES_FILE || path.join(__dirname, '../../data/workspaces.json');

const DEFAULT_WORKSPACES = [{ id: 'default', name: 'Default', createdAt: new Date().toISOString() }];

async function ensureFile() {
  try {
    await fs.access(WORKSPACES_FILE);
  } catch {
    await fs.mkdir(path.dirname(WORKSPACES_FILE), { recursive: true });
    await fs.writeFile(WORKSPACES_FILE, JSON.stringify(DEFAULT_WORKSPACES, null, 2));
  }
}

async function listWorkspacesFromFile() {
  await ensureFile();
  const content = await fs.readFile(WORKSPACES_FILE, 'utf-8');
  return JSON.parse(content);
}

async function createWorkspaceInFile(name) {
  const workspaces = await listWorkspacesFromFile();
  const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (workspaces.some((w) => w.id === id)) {
    throw { status: 409, message: 'Workspace already exists' };
  }
  const workspace = { id, name, createdAt: new Date().toISOString() };
  workspaces.push(workspace);
  await fs.writeFile(WORKSPACES_FILE, JSON.stringify(workspaces, null, 2));
  return workspace;
}

export async function listWorkspaces() {
  if (isDatabaseEnabled()) {
    return workspacesRepo.listWorkspaces();
  }
  return listWorkspacesFromFile();
}

export async function createWorkspace(name) {
  if (isDatabaseEnabled()) {
    return workspacesRepo.createWorkspace(name);
  }
  return createWorkspaceInFile(name);
}
