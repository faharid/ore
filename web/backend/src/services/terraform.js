import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TERRAFORM_DIR =
  process.env.TERRAFORM_DIR || path.join(__dirname, '../../../../terraform');

const initLocks = new Map();

export function stripANSI(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\033\[[0-9;]*m/g, '');
}

function checkTerraformInstalled() {
  try {
    execSync('terraform version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function enrichError(result) {
  if (result.success) return result;
  const stderr = result.stderr.toLowerCase();
  if (stderr.includes('backend initialization required')) {
    result.error = 'Backend initialization failed. Ensure S3 bucket exists and credentials are valid.';
  } else if (stderr.includes('no such file or directory')) {
    result.error = `File not found. Check terraform directory: ${TERRAFORM_DIR}`;
  } else if (stderr.includes('unauthorized')) {
    result.error = 'AWS credentials invalid or expired. Check your AWS configuration.';
  } else if (stderr.includes('access denied')) {
    result.error = 'Access denied. Your AWS IAM user needs permissions for the resources being deployed.';
  }
  return result;
}

export async function ensureTerraformInit(envVars = {}) {
  const hasTerraform = await fileExists(path.join(TERRAFORM_DIR, '.terraform'));
  if (hasTerraform) return true;

  if (initLocks.has('init')) {
    return initLocks.get('init');
  }

  const initPromise = (async () => {
    try {
      const initArgs = ['init', '-input=false'];
      const backendHcl = path.join(TERRAFORM_DIR, 'backend.hcl');
      const useLocal = process.env.TERRAFORM_LOCAL_BACKEND === 'true';

      if (useLocal) {
        initArgs.push('-reconfigure');
      } else if (await fileExists(backendHcl)) {
        initArgs.push(`-backend-config=${backendHcl}`);
      }

      const result = await runTerraform(initArgs, envVars);
      if (!result.success) {
        const hint = useLocal
          ? ' Run: cd ore/terraform && ./scripts/init-local-state.sh'
          : ' Create backend.hcl and run terraform init, or set TERRAFORM_LOCAL_BACKEND=true';
        throw new Error((result.error || result.stderr || 'Terraform init failed') + hint);
      }
      return true;
    } finally {
      initLocks.delete('init');
    }
  })();

  initLocks.set('init', initPromise);
  return initPromise;
}

function emitLines(chunk, type, onEvent) {
  const cleaned = stripANSI(chunk);
  const lines = cleaned.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      onEvent({ type, message: line });
    }
  }
}

export function streamTerraform(args, envVars = {}, onEvent) {
  return new Promise((resolve) => {
    if (!checkTerraformInstalled()) {
      onEvent({ type: 'error', message: 'Terraform is not installed. Please install from https://terraform.io' });
      return resolve(false);
    }

    const proc = spawn('terraform', args, {
      cwd: TERRAFORM_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, ...envVars }
    });

    let hasError = false;

    proc.stdout.on('data', (data) => emitLines(data.toString(), 'stdout', onEvent));
    proc.stderr.on('data', (data) => {
      emitLines(data.toString(), 'stderr', onEvent);
      if (data.toString().toLowerCase().includes('error')) hasError = true;
    });

    proc.on('error', (err) => {
      hasError = true;
      onEvent({
        type: 'error',
        message: err.code === 'ENOENT'
          ? 'Terraform executable not found. Ensure terraform is in your PATH'
          : err.message
      });
      resolve(false);
    });

    proc.on('close', (code) => {
      if (code === 0 && !hasError) {
        onEvent({ type: 'success', message: 'Terraform command completed successfully' });
        resolve(true);
      } else {
        onEvent({ type: 'error', message: `Terraform failed with exit code ${code}` });
        resolve(false);
      }
    });
  });
}

export function runTerraform(args, envVars = {}) {
  return new Promise((resolve, reject) => {
    if (!checkTerraformInstalled()) {
      return reject(new Error('Terraform is not installed. Please install from https://terraform.io'));
    }

    const outputs = [];
    const errors = [];

    const proc = spawn('terraform', args, {
      cwd: TERRAFORM_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, ...envVars }
    });

    proc.stdout.on('data', (data) => outputs.push(stripANSI(data.toString())));
    proc.stderr.on('data', (data) => errors.push(stripANSI(data.toString())));

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('Terraform executable not found. Please ensure terraform is in your PATH'));
      } else {
        reject(err);
      }
    });

    proc.on('close', (code) => {
      const result = enrichError({
        exitCode: code,
        stdout: outputs.join(''),
        stderr: errors.join(''),
        success: code === 0
      });
      resolve(result);
    });
  });
}

export async function getOutputs(envVars = {}) {
  try {
    await ensureTerraformInit(envVars);
    const result = await runTerraform(['output', '-json'], envVars);
    if (!result.success) {
      const stderr = (result.stderr || '').toLowerCase();
      if (stderr.includes('no outputs') || stderr.includes('warning: no outputs')) {
        return {};
      }
      throw new Error(result.error || result.stderr || 'Failed to get outputs');
    }
    try {
      return JSON.parse(result.stdout || '{}');
    } catch {
      return {};
    }
  } catch (err) {
    const message = err.message || 'Failed to retrieve terraform outputs';
    throw { status: err.status || 500, message };
  }
}

export async function getPlan(envVars = {}) {
  try {
    const planPath = path.join(TERRAFORM_DIR, 'tfplan');
    if (!(await fileExists(planPath))) return null;

    const result = await runTerraform(['show', '-json', 'tfplan'], envVars);
    if (!result.success) return null;
    try {
      return JSON.parse(result.stdout);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export function getTerraformDir() {
  return TERRAFORM_DIR;
}
