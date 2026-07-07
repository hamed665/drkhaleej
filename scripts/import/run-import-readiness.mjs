import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const checks = [
  ['hospital public hold', ['scripts/import/check-imported-hospital-public-hold.mjs']],
  ['first batch dry-run fixture', ['scripts/import/check-first-batch-real-fixture.mjs']],
  ['generated first batch dry-run fixture', ['scripts/import/generate-first-batch-dry-run-fixture.mjs', '--check']],
  ['first batch generator bridge alignment', ['scripts/import/check-first-batch-generator-bridge-alignment.mjs']],
  ['first batch bridge runtime preflight', ['scripts/import/check-first-batch-bridge-runtime-preflight.mjs']],
  ['import public release preflight', ['scripts/import/check-import-public-release-preflight-contract.mjs']],
  ['combined smoke', ['scripts/import/check-import-readiness-combined-smoke.mjs']],
];

for (const [label, args] of checks) {
  const [script, ...scriptArgs] = args;
  await execFileAsync(process.execPath, [script, ...scriptArgs], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });
  console.log(`passed: ${label}`);
}

console.log('import readiness runner passed.');
