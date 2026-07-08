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

for (const check of manifest.checks) {
  const [script, ...scriptArgs] = check.command;

  try {
    const result = await execFileAsync(process.execPath, [script, ...scriptArgs], {
      cwd: root,
      stdio: 'pipe',
    });

    if (result.stdout.trim().length > 0) console.log(result.stdout.trim());
    if (result.stderr.trim().length > 0) console.error(result.stderr.trim());
    console.log(`passed: ${check.label}`);
  } catch (error) {
    console.error(`failed: ${check.label}`);
    if (typeof error.stdout === 'string' && error.stdout.trim().length > 0) console.error(error.stdout.trim());
    if (typeof error.stderr === 'string' && error.stderr.trim().length > 0) console.error(error.stderr.trim());
    throw error;
  }
}

console.log('import readiness runner passed.');
