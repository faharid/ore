import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENVIRONMENTS_DIR =
  process.env.ENVIRONMENTS_DIR ||
  path.join(__dirname, '../../../../terraform/environments');
const TERRAFORM_DIR =
  process.env.TERRAFORM_DIR || path.join(__dirname, '../../../../terraform');

function getEnvDir(workspace = 'default') {
  if (workspace && workspace !== 'default') {
    return path.join(ENVIRONMENTS_DIR, workspace);
  }
  return ENVIRONMENTS_DIR;
}

function toHCL(obj, indent = '') {
  let result = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      result += `${indent}${key} = "${value.replace(/"/g, '\\"')}"\n`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result += `${indent}${key} = ${value}\n`;
    } else if (Array.isArray(value)) {
      const items = value.map((v) =>
        typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : v
      );
      result += `${indent}${key} = [${items.join(', ')}]\n`;
    } else if (typeof value === 'object') {
      result += `${indent}${key} = {\n`;
      result += toHCL(value, indent + '  ');
      result += `${indent}}\n`;
    }
  }
  return result;
}

function parseValue(val) {
  val = val.trim().replace(/^"|"$/g, '');
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (!isNaN(val) && val !== '') return Number(val);
  return val;
}

function fromHCL(content) {
  const obj = {};
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    i++;

    if (!trimmed || trimmed.startsWith('#')) continue;

    const objectMatch = trimmed.match(/^(\w+)\s*=\s*\{$/);
    if (objectMatch) {
      const key = objectMatch[1];
      const nested = {};
      while (i < lines.length) {
        const inner = lines[i].trim();
        i++;
        if (inner === '}') break;
        if (!inner || inner.startsWith('#')) continue;
        const pair = inner.match(/^(\w+)\s*=\s*(.+)$/);
        if (pair) nested[pair[1]] = parseValue(pair[2]);
      }
      obj[key] = nested;
      continue;
    }

    const listMatch = trimmed.match(/^(\w+)\s*=\s*\[(.*)\]$/);
    if (listMatch) {
      const items = listMatch[2]
        .split(',')
        .map((v) => parseValue(v.trim()))
        .filter((v) => v !== '');
      obj[listMatch[1]] = items;
      continue;
    }

    const simpleMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (simpleMatch) {
      obj[simpleMatch[1]] = parseValue(simpleMatch[2]);
    }
  }

  return obj;
}

export async function listEnvironments(workspace = 'default') {
  const dir = getEnvDir(workspace);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith('.tfvars'))
      .map((f) => f.replace('.tfvars', ''));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function readConfig(env, workspace = 'default') {
  const filePath = path.join(getEnvDir(workspace), `${env}.tfvars`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return fromHCL(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw { status: 404, message: `Environment ${env} not found` };
    }
    throw err;
  }
}

export async function writeConfig(env, config, workspace = 'default') {
  const dir = getEnvDir(workspace);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${env}.tfvars`);
  const hcl = toHCL(config);
  await fs.writeFile(filePath, hcl, 'utf-8');
  return config;
}

export async function deleteConfig(env, workspace = 'default') {
  const filePath = path.join(getEnvDir(workspace), `${env}.tfvars`);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

export function getTerraformDir() {
  return TERRAFORM_DIR;
}

export function getEnvironmentsDir(workspace = 'default') {
  return getEnvDir(workspace);
}
