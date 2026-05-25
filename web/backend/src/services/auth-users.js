import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isDatabaseEnabled } from '../../db/pool.js';
import * as usersRepo from '../../db/repositories/users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_INSECURE_SECRETS = [
  'dev-secret-change-in-prod',
  'your-super-secret-key-change-this',
  'your-secret-key'
];

export function validateJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (!secret) return;
  if (
    process.env.NODE_ENV === 'production' &&
    DEFAULT_INSECURE_SECRETS.some((s) => secret.includes(s))
  ) {
    throw new Error('JWT_SECRET must be changed from default value in production');
  }
}

async function getUsersFromFile() {
  if (process.env.USERS_FILE) {
    const filePath = path.resolve(process.env.USERS_FILE);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }
  try {
    return JSON.parse(process.env.USERS || '[]');
  } catch {
    console.error('Failed to parse USERS from environment');
    return [];
  }
}

export async function getUsers() {
  if (isDatabaseEnabled()) {
    return usersRepo.listUsers();
  }
  return getUsersFromFile();
}

export async function findUserByUsername(username) {
  if (isDatabaseEnabled()) {
    return usersRepo.findUserByUsername(username);
  }
  const users = await getUsersFromFile();
  return users.find((u) => u.username === username) || null;
}
