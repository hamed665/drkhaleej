import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const checks = [
  ['hospital public hold', 'scripts/import/check-imported-hospital-public-hold.mjs'],
  ['first batch dry-run fixture', 'scripts/import/check-first-batch-real-fixture.mjs'],
  ['generated first batch dry-run fixture', 'scripts/import/generate-first-batch-dry-run-fixture.mjs', '--check'],
  ['first batch generator bridge alignment', 'scripts/import/check-first-batch-generator-bridge-alignment.mjs'],
  ['import public release preflight', 'scripts/import/check-import-public-release-preflight-contract.mjs'],
];

for (const [label, script, ...args] of checks) {
  await execFileAsync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });
  console.log(`passed: ${label}`);
}

console.log('import readiness combined smoke passed.');
