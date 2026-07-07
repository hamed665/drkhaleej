import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputFile = 'fixtures/import/first-batch-dry-run.input.json';
const outputFile = 'fixtures/import/first-batch-dry-run.fixture.json';
const families = ['doctor', 'pharmacy', 'hospital'];

async function readJson(file) {
  return JSON.parse(await readFile(path.join(root, file), 'utf8'));
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function selectedCount(selection, family) {
  return selection.rows.filter((row) => row.family === family && row.qaStatus === 'selected').length;
}

function familySummary(selection, family, override = {}) {
  const count = selectedCount(selection, family);
  const blockers = override.blockers ?? [];
  return {
    selectedCount: count,
    eligibleCount: override.eligibleCount ?? count,
    blockedCount: override.blockedCount ?? blockers.length,
    sitemapUrlCount: override.sitemapUrlCount ?? count,
    sampledUrlCount: override.sampledUrlCount ?? 0,
    blockers,
    samples: override.samples ?? [],
  };
}

function buildReport(input) {
  const selection = input.selection;
  const byFamily = Object.fromEntries(
    families.map((family) => [family, familySummary(selection, family, input.familyOverrides?.[family])]),
  );
  const failedCheck = input.checks.some((check) => check.passed !== true);
  const blockedFamily = families.some((family) => byFamily[family].blockedCount > 0 || byFamily[family].blockers.length > 0);
  const sitemapIssue = input.sitemap.unexpectedUrlCount > 0 || input.sitemap.unexpectedUrls.length > 0;
  const relationIssue = input.hospitalRelations.unsafePublicCount > 0 || input.hospitalRelations.unsafePublicBlockers.length > 0;
  const suggestionIssue = input.localSuggestions.unsafePublicCount > 0 || input.localSuggestions.unsafePublicBlockers.length > 0;

  return {
    schemaVersion: 'drkhaleej.import.batchDryRun.v1',
    rehearsalId: selection.selectionId,
    generatedAt: selection.generatedAt,
    commitSha: null,
    decision: failedCheck || blockedFamily || sitemapIssue || relationIssue || suggestionIssue ? 'no_go' : 'go',
    caps: selection.caps,
    checks: input.checks,
    sitemap: input.sitemap,
    byFamily,
    hospitalRelations: input.hospitalRelations,
    localSuggestions: input.localSuggestions,
    notes: input.notes ?? [],
  };
}

const input = await readJson(inputFile);
const output = formatJson(buildReport(input));

if (process.argv.includes('--write')) {
  await writeFile(path.join(root, outputFile), output);
  console.log('fixture written');
} else if (process.argv.includes('--check')) {
  const current = await readFile(path.join(root, outputFile), 'utf8');
  if (current !== output) throw new Error('fixture output is stale');
  console.log('fixture generation check passed.');
} else {
  process.stdout.write(output);
}
