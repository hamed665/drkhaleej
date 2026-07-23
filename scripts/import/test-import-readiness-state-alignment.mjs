import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = process.cwd();
const scriptPath = fileURLToPath(new URL('./check-import-readiness-state-alignment.mjs', import.meta.url));
const fixtureFiles = [
  'docs/import/import-readiness-roadmap-after-933.md',
  'docs/project-state/CURRENT_STATE.md',
  'docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md',
  'README.md',
];

async function seedFixture(root) {
  for (const relativePath of fixtureFiles) {
    await cp(path.join(repositoryRoot, relativePath), path.join(root, relativePath), {
      recursive: true,
    });
  }
}

async function runValidator(root) {
  return execFileAsync(process.execPath, [scriptPath, '--root', root], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

async function expectDriftFailure(root, testCase) {
  await seedFixture(root);
  const targetPath = path.join(root, testCase.file);
  const source = await readFile(targetPath, 'utf8');
  const mutated = source.replace(testCase.from, testCase.to);

  if (mutated === source) throw new Error(`test setup failed to mutate ${testCase.file}`);
  await writeFile(targetPath, mutated);

  try {
    await runValidator(root);
    throw new Error(`${testCase.label}: validator unexpectedly accepted drift`);
  } catch (error) {
    if (error.message.includes('unexpectedly accepted drift')) throw error;
    const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
    if (!output.includes(testCase.expectedError)) {
      throw new Error(`${testCase.label}: expected bounded error containing ${testCase.expectedError}`);
    }
  }
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'drkhaleej-state-alignment-'));

try {
  await seedFixture(temporaryRoot);
  await runValidator(temporaryRoot);

  for (const testCase of [
    {
      label: 'canonical manifest drift',
      file: fixtureFiles[0],
      from: '"currentNext": "ROLLBACK-AUTHORITY-HARDENING"',
      to: '"currentNext": "ROLLBACK-EXACT-RECOVERY"',
      expectedError: 'manifest.currentNext drifted',
    },
    {
      label: 'current state drift',
      file: fixtureFiles[1],
      from: '| Current migration | `0082_import_pharmacy_private_execution_audit.sql` |',
      to: '| Current migration | `0081_import_pharmacy_reservation_audit_split.sql` |',
      expectedError: 'Current migration value drifted',
    },
    {
      label: 'phase matrix drift',
      file: fixtureFiles[2],
      from: '| Private Admin wiring and publish readback | Complete | #954 | `ROLLBACK-AUTHORITY-HARDENING` |',
      to: '| Private Admin wiring and publish readback | Complete | #953 | `ROLLBACK-AUTHORITY-HARDENING` |',
      expectedError: 'Private Admin wiring and publish readback evidence drifted',
    },
    {
      label: 'README pointer drift',
      file: fixtureFiles[3],
      from: '[`docs/import/import-readiness-roadmap-after-933.md`](docs/import/import-readiness-roadmap-after-933.md)',
      to: '[stale roadmap](docs/import/stale.md)',
      expectedError: 'current status token drifted',
    },
  ]) {
    await expectDriftFailure(temporaryRoot, testCase);
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log('import readiness state alignment mutation tests passed.');
