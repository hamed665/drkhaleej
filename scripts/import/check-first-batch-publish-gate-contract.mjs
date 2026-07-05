import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function main() {
  const contract = await readText('docs/import/first-batch-publish-gate-contract.md');
  const writePathContract = await readText('docs/import/first-batch-write-path-contract.md');
  const workflow = await readText('.github/workflows/import-runner-checks.yml');

  for (const token of [
    '# First-batch publish-gate contract',
    'documentation only',
    'No publish-gate implementation PR may be opened until',
    'the draft/staging import implementation has merged',
    'rollback has been tested for the draft/staging import run',
    'The first publish-gate implementation may only promote already imported draft/staging records',
    'importing new data during publish',
    'performing network fetches during publish',
    'publishing rows with unsafe local suggestions',
    'publishing rows with unsafe hospital relations',
    'node scripts/import/run-first-batch-publish-gate.mjs',
    'The command name is reserved by this contract.',
    'Plan mode must not write public visibility, sitemap, schema, route, or search/listing state.',
    'Public visibility must remain false until apply mode passes all gates.',
    'A publish gate must define rollback before it defines apply.',
    'Every publish action must create internal audit entries.',
    'plan mode has no public side effects',
    'apply mode is blocked unless plan mode passes',
    'A publish-gate implementation may merge only when',
  ]) {
    assert(contract.includes(token), `publish-gate contract must include ${token}`);
  }

  assert(writePathContract.includes('Any future public promotion must be a separate publish-gate PR after import write path validation.'), 'write path contract must keep public promotion behind a separate publish-gate PR.');
  assert(!workflow.includes('run-first-batch-publish-gate.mjs'), 'Import Runner Checks workflow must not run a publish gate before implementation is approved.');

  console.log('first batch publish gate contract check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
