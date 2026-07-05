import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function main() {
  const validatorSource = await readText('scripts/import/validate-first-batch-dry-run-report.mjs');
  const workflowSource = await readText('.github/workflows/import-runner-checks.yml');
  const operatorGuide = await readText('docs/import/first-real-batch-operator-guide.md');
  const dataReadme = await readText('data/import/README.md');
  const goFixture = await readJson('docs/import/fixtures/first-batch-runner-go.fixture.json');
  const noGoFixture = await readJson('docs/import/fixtures/first-batch-runner-no-go.fixture.json');

  for (const token of [
    'validate-first-batch-dry-run-report.mjs --input <report.json>',
    '--expect must be go, no_go, or any.',
    'go report must have every required check passed.',
    'go report localSuggestions.unsafePublicBlockers must be empty.',
    'go report hospitalRelations.unsafePublicBlockers must be empty.',
    'This validator reads a local JSON file only.',
  ]) {
    assert(validatorSource.includes(token), `report validator must include ${token}`);
  }

  for (const token of [
    'node scripts/import/validate-first-batch-dry-run-report.mjs',
    '--expect go',
    './tmp/first-batch.dry-run-report.json',
  ]) {
    assert(operatorGuide.includes(token) || dataReadme.includes(token), `operator docs must include ${token}`);
  }

  assert(workflowSource.includes('node scripts/import/check-first-batch-dry-run-report-review.mjs'), 'Import Runner Checks workflow must run the report review checker.');
  assert(goFixture.decision !== 'no_go', 'go fixture must not be a no_go fixture.');
  assert(noGoFixture.localSuggestions.unsafePublicCount > 0, 'no_go fixture must include unsafe public local suggestions.');
  assert(noGoFixture.localSuggestions.unsafePublicBlockers.some((blocker) => blocker.reason === 'location_mismatch'), 'no_go fixture must include location_mismatch.');
  assert(noGoFixture.localSuggestions.unsafePublicBlockers.some((blocker) => blocker.reason === 'unsupported_family'), 'no_go fixture must include unsupported_family.');

  console.log('first batch dry-run report review check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
