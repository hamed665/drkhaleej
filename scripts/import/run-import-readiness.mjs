import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const manifestPath = 'fixtures/import/import-readiness-runner.manifest.json';

const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));

if (manifest.schemaVersion !== 'drkhaleej.import.readinessRunnerManifest.v1') {
  throw new Error('Unsupported import readiness runner manifest schema.');
}

function getProcessOutput(error, key) {
  if (typeof error !== 'object' || error === null || !(key in error)) return null;

  const value = error[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

for (const check of manifest.checks) {
  const [script, ...scriptArgs] = check.command;

  try {
    await execFileAsync(process.execPath, [script, ...scriptArgs], {
      cwd: root,
      stdio: 'pipe',
    });

    console.log(`passed: ${check.label}`);
  } catch (error) {
    const stdout = getProcessOutput(error, 'stdout');
    const stderr = getProcessOutput(error, 'stderr');

    console.error(`failed: ${check.label}`);
    if (stdout !== null) console.error(stdout);
    if (stderr !== null) console.error(stderr);
    throw error;
  }
}

console.log('import readiness runner passed.');
