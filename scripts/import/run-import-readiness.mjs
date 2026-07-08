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
    await execFileAsync(process.execPath, [script, ...scriptArgs], {
      cwd: root,
      stdio: 'pipe',
    });
  } catch (error) {
    console.error(`failed: ${check.label}`);
    if (error?.stdout) console.error(String(error.stdout));
    if (error?.stderr) console.error(String(error.stderr));
    throw error;
  }
  console.log(`passed: ${check.label}`);
}

console.log('import readiness runner passed.');
