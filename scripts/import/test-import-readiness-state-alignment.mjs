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
  'docs/import/WORKER_RUNTIME_ADR_GATE.md',
  'docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md',
  'docs/import/AUTOMATION_JOB_RUNTIME.md',
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
      from: '"currentNext": "AUTOMATION-JOB-PREVIEW-ACTIVATION"',
      to: '"currentNext": "CONTRACT-HARDENING"',
      expectedError: 'manifest.currentNext drifted',
    },
    {
      label: 'wave 8 drift',
      file: fixtureFiles[0],
      from: '"8": "PARTIAL"',
      to: '"8": "OPEN"',
      expectedError: 'manifest.waves.8 drifted',
    },
    {
      label: 'current state drift',
      file: fixtureFiles[1],
      from: '| Current migration | `0095_import_automation_job_runtime.sql` |',
      to: '| Current migration | `0094_import_entity_resolution_gate.sql` |',
      expectedError: 'Current migration value drifted',
    },
    {
      label: 'phase matrix drift',
      file: fixtureFiles[2],
      from: '| Real Admin canary | Complete | #958 | Maintain literal-cycle regression |',
      to: '| Real Admin canary | Complete | #957 | Maintain literal-cycle regression |',
      expectedError: 'Real Admin canary evidence drifted',
    },
    {
      label: 'README pointer drift',
      file: fixtureFiles[3],
      from: '[`docs/import/import-readiness-roadmap-after-933.md`](docs/import/import-readiness-roadmap-after-933.md)',
      to: '[stale roadmap](docs/import/stale.md)',
      expectedError: 'current status token drifted',
    },
    {
      label: 'Worker runtime ADR boundary drift',
      file: fixtureFiles[4],
      from: 'Subphase ID: `WORKER-RUNTIME-ADR`',
      to: 'Subphase ID: `AUTOMATION-JOB-RUNTIME`',
      expectedError: 'required closed-boundary token drifted',
    },
    {
      label: 'Worker runtime provider drift',
      file: fixtureFiles[5],
      from: '"provider": "Render Background Worker"',
      to: '"provider": "Unreviewed Worker Host"',
      expectedError: 'manifest.worker.provider drifted',
    },
    {
      label: 'Worker runtime TTL drift',
      file: fixtureFiles[5],
      from: '"maxTtlSeconds": 300',
      to: '"maxTtlSeconds": 600',
      expectedError: 'manifest.identity.maxTtlSeconds drifted',
    },
    {
      label: 'Worker runtime authorization drift',
      file: fixtureFiles[5],
      from: '"implementationAuthorized": false',
      to: '"implementationAuthorized": true',
      expectedError: 'manifest.implementationAuthorized drifted',
    },
    {
      label: 'Worker forbidden scope drift',
      file: fixtureFiles[5],
      from: '    "publish",\n    "rollback",',
      to: '    "rollback",',
      expectedError: 'manifest.deniedScopes drifted',
    },
    {
      label: 'Automation runtime activation drift',
      file: fixtureFiles[6],
      from: 'all controls and identities default disabled',
      to: 'all controls and identities default enabled',
      expectedError: 'required closed-runtime token drifted',
    },
    {
      label: 'Worker raw-network boundary drift',
      file: fixtureFiles[5],
      from: 'direct imports of `fetch`,\n`http`, `https`, socket or alternate HTTP clients are forbidden',
      to: 'direct network clients are allowed',
      expectedError: 'required concrete-decision token drifted',
    },
  ]) {
    await expectDriftFailure(temporaryRoot, testCase);
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log('import readiness state alignment mutation tests passed.');
