import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = process.cwd();
const transformerPath = 'scripts/import/transform-first-batch-csv-to-dry-run-json.mjs';
const runnerPath = 'scripts/import/run-first-batch-dry-run.mjs';
const fixturePath = 'docs/import/fixtures/first-batch-csv-transformer.fixture.csv';
const outputDir = '.tmp/import-first-batch-csv-transformer-check';
const schemaVersion = 'drkhaleej.import.batchDryRun.v1';

const sideEffectSentinels = [
  'package.json',
  '.github/workflows/ci.yml',
  transformerPath,
  runnerPath,
  fixturePath,
  'src/server/admin/import-batch-dry-run-report.ts',
  'src/server/admin/import-batch-dry-run-payload-adapter.ts',
  'src/server/admin/import-first-batch-dry-run-bridge.ts',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/doctors/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx',
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(absolute(relativePath), 'utf8'));
}

async function readText(relativePath) {
  return readFile(absolute(relativePath), 'utf8');
}

async function hashFile(relativePath) {
  if (!existsSync(absolute(relativePath))) return null;
  const content = await readFile(absolute(relativePath));
  return createHash('sha256').update(content).digest('hex');
}

async function snapshotSentinels() {
  const snapshot = new Map();
  for (const filePath of sideEffectSentinels) {
    snapshot.set(filePath, await hashFile(filePath));
  }
  return snapshot;
}

async function assertSnapshotUnchanged(before) {
  for (const [filePath, beforeHash] of before.entries()) {
    const afterHash = await hashFile(filePath);
    if (afterHash !== beforeHash) throw new Error(`CSV transformer must not mutate side-effect sentinel: ${filePath}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runNode(args, label) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error([
      `${label} failed.`,
      result.stdout?.trim() ? `stdout: ${result.stdout.trim()}` : null,
      result.stderr?.trim() ? `stderr: ${result.stderr.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n'));
  }
  return result;
}

function runNodeExpectFailure(args, label) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status === 0) throw new Error(`${label} must fail but exited 0.`);
  return result;
}

function blockerReasons(blockers) {
  return blockers.map((blocker) => blocker.reason);
}

async function assertTransformerSourceContract() {
  const source = await readText(transformerPath);
  for (const token of [
    'parseCsv(source)',
    'unterminated quoted field',
    '--checks must be passed or failed',
    'It performs no database, network, route, sitemap, schema, migration, or public-rendering writes.',
    'location_mismatch',
    'unsupported_family',
    'target_candidate_missing',
    'hospital_relation',
    'local_suggestion',
  ]) {
    assert(source.includes(token), `CSV transformer source must include contract token: ${token}`);
  }
}

async function main() {
  await assertTransformerSourceContract();
  await rm(absolute(outputDir), { recursive: true, force: true });
  await mkdir(absolute(outputDir), { recursive: true });

  const before = await snapshotSentinels();

  const dryRunInput = `${outputDir}/first-batch-from-csv.json`;
  runNode([
    transformerPath,
    '--input',
    fixturePath,
    '--output',
    dryRunInput,
    '--checks',
    'passed',
    '--rehearsal-id',
    'first-batch-csv-transformer-fixture',
    '--generated-at',
    '2026-07-05T00:00:00.000Z',
    '--commit-sha',
    'csv-transformer-fixture',
  ], 'CSV transformer fixture run');

  const transformed = await readJson(dryRunInput);
  assert(transformed.schemaVersion === schemaVersion, 'transformed JSON must keep the dry-run schema version.');
  assert(transformed.byFamily.doctor.selectedCount === 1, 'fixture must select one doctor.');
  assert(transformed.byFamily.pharmacy.selectedCount === 1, 'fixture must select one pharmacy.');
  assert(transformed.byFamily.hospital.selectedCount === 1, 'fixture must select one hospital.');
  assert(transformed.byFamily.doctor.blockedCount === 0, 'fixture candidate rows must not create doctor blockers.');
  assert(transformed.localSuggestions.totalRows === 3, 'fixture must transform three local suggestion rows.');
  assert(transformed.localSuggestions.publicVisibleCount === 1, 'fixture must keep one public-safe local suggestion.');
  assert(transformed.localSuggestions.unsafePublicCount === 2, 'fixture must keep two unsafe public local suggestions.');
  const localReasons = blockerReasons(transformed.localSuggestions.unsafePublicBlockers);
  assert(localReasons.includes('location_mismatch'), 'fixture must preserve location_mismatch blocker.');
  assert(localReasons.includes('unsupported_family'), 'fixture must preserve unsupported_family blocker.');
  assert(localReasons.includes('target_candidate_missing'), 'fixture must preserve target_candidate_missing blocker for unsupported future family.');

  const reportOutput = `${outputDir}/first-batch-report.json`;
  runNode([runnerPath, '--input', dryRunInput, '--output', reportOutput], 'dry-run runner after CSV transform');
  const report = await readJson(reportOutput);
  assert(report.schemaVersion === schemaVersion, 'runner report must keep the dry-run schema version.');
  assert(report.decision === 'no_go', 'unsafe transformed fixture must keep decision: no_go.');
  assert(report.localSuggestions.unsafePublicCount === 2, 'runner report must preserve unsafe public local suggestion count.');

  const badCsv = `${outputDir}/bad.csv`;
  const badOutput = `${outputDir}/bad.json`;
  await writeFile(absolute(badCsv), 'row_type,family\ncandidate,"doctor\n', 'utf8');
  runNodeExpectFailure([transformerPath, '--input', badCsv, '--output', badOutput], 'bad CSV transform');
  assert(!existsSync(absolute(badOutput)), 'bad CSV input must not leave an output file behind.');

  await assertSnapshotUnchanged(before);
  console.log('first batch CSV transformer check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
