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
  const contract = await readText('docs/import/first-batch-source-evidence-contract.md');
  const examples = await readText('docs/import/examples/source-evidence-examples.md');
  const reviewTemplate = await readText('docs/import/first-batch-dry-run-pr-template.md');
  const operatorGuide = await readText('docs/import/first-real-batch-operator-guide.md');

  for (const token of [
    '# First-batch source evidence contract',
    'documentation only',
    'No real first-batch dry-run PR may be opened until every selected row has reviewed source evidence and a checked date.',
    '`source_name` or `source_url`',
    '`last_checked_at`',
    '`contact_or_map_signal`',
    '`area`',
    '`governorate`',
    '`candidate_key`',
    '`slug`',
    'Do not use vague labels',
    'future dates are forbidden',
    'Rows with `held` or `removed` status must not be imported or published.',
    'A public-visible local suggestion must have:',
    'A public-visible hospital relation must have:',
    'The QA owner must verify:',
    'count of selected rows missing `last_checked_at`, which must be zero',
    'selected rows without source anchors are zero',
  ]) {
    assert(contract.includes(token), `source evidence contract must include ${token}`);
  }

  for (const token of [
    'A local suggestion can only be public-safe when it has a source anchor and a checked date.',
    '`Provider official website`',
    '`Google Business Profile`',
    'a source anchor: `source_name` or `source_url`',
    'a checked date: `last_checked_at`',
  ]) {
    assert(examples.includes(token), `source evidence examples must include ${token}`);
  }

  for (const token of [
    'Source evidence summary',
    'Rows missing `last_checked_at`: must be zero',
    'No real provider CSV is committed.',
  ]) {
    assert(reviewTemplate.includes(token), `dry-run review template must include ${token}`);
  }

  assert(operatorGuide.includes('source evidence summary'), 'operator guide must require source evidence summary.');

  console.log('first batch source evidence contract check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
