import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = process.cwd();
const runnerPath = 'scripts/import/run-first-batch-dry-run.mjs';
const outputDir = '.tmp/import-first-batch-runner-check';
const schemaVersion = 'drkhaleej.import.batchDryRun.v1';

const sideEffectSentinels = [
  'package.json',
  '.github/workflows/ci.yml',
  runnerPath,
  'docs/import/first-real-dry-run-script-contract.md',
  'src/server/admin/import-batch-dry-run-report.ts',
  'src/server/admin/import-first-batch-dry-run-bridge.ts',
  'src/server/admin/import-batch-dry-run-payload-adapter.ts',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/doctors/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx',
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

async function readText(relativePath) {
  return readFile(absolute(relativePath), 'utf8');
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
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
    if (afterHash !== beforeHash) {
      throw new Error(`Dry-run runner must not mutate side-effect sentinel: ${filePath}`);
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runRunner(inputPath, outputPath) {
  const result = spawnSync(process.execPath, [runnerPath, '--input', inputPath, '--output', outputPath], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error([
      `Runner failed for ${inputPath}.`,
      result.stdout?.trim() ? `stdout: ${result.stdout.trim()}` : null,
      result.stderr?.trim() ? `stderr: ${result.stderr.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n'));
  }
}

function assertCommonReportShape(report, label) {
  assert(report && typeof report === 'object' && !Array.isArray(report), `${label} output must be a JSON object.`);
  assert(report.schemaVersion === schemaVersion, `${label} output must use ${schemaVersion}.`);
  assert(typeof report.rehearsalId === 'string' && report.rehearsalId.length > 0, `${label} output must include rehearsalId.`);
  assert(Array.isArray(report.checks), `${label} output must include checks.`);
  assert(report.sitemap && typeof report.sitemap === 'object', `${label} output must include sitemap.`);
  assert(report.byFamily && typeof report.byFamily === 'object', `${label} output must include byFamily.`);
  assert(report.hospitalRelations && typeof report.hospitalRelations === 'object', `${label} output must include hospitalRelations.`);
  assert(report.localSuggestions && typeof report.localSuggestions === 'object', `${label} output must include localSuggestions.`);
}

function unsafeLocalSuggestionReasons(report) {
  return (report.localSuggestions.unsafePublicBlockers ?? []).map((blocker) => blocker.reason);
}

async function assertRunnerSourceContract() {
  const runner = await readText(runnerPath);
  for (const token of [
    'node scripts/import/run-first-batch-dry-run.mjs --input <path> --output <path>',
    'It performs no database, network, route, sitemap, schema, or public-rendering writes.',
    'schemaVersion = \'drkhaleej.import.batchDryRun.v1\'',
    'function decide(report)',
    "return 'go';",
  ]) {
    assert(runner.includes(token), `runner source must include contract token: ${token}`);
  }
}

async function main() {
  await assertRunnerSourceContract();
  await rm(absolute(outputDir), { recursive: true, force: true });
  await mkdir(absolute(outputDir), { recursive: true });

  const before = await snapshotSentinels();

  const noGoInput = 'docs/import/fixtures/first-batch-runner-no-go.fixture.json';
  const noGoOutput = `${outputDir}/no-go-report.json`;
  runRunner(noGoInput, noGoOutput);
  const noGoReport = await readJson(noGoOutput);
  assertCommonReportShape(noGoReport, 'no_go fixture');
  assert(noGoReport.decision === 'no_go', 'unsafe fixture must keep decision: no_go.');
  assert(noGoReport.localSuggestions.unsafePublicCount === 2, 'unsafe fixture must preserve unsafe public local suggestion count.');
  const noGoReasons = unsafeLocalSuggestionReasons(noGoReport);
  assert(noGoReasons.includes('location_mismatch'), 'unsafe fixture must preserve location_mismatch blocker.');
  assert(noGoReasons.includes('unsupported_family'), 'unsafe fixture must preserve unsupported_family blocker.');

  const goInput = 'docs/import/fixtures/first-batch-runner-go.fixture.json';
  const goOutput = `${outputDir}/go-report.json`;
  runRunner(goInput, goOutput);
  const goReport = await readJson(goOutput);
  assertCommonReportShape(goReport, 'go fixture');
  assert(goReport.decision === 'go', 'clean fixture must produce decision: go.');
  assert(goReport.hospitalRelations.unsafePublicCount === 0, 'clean fixture must not have unsafe public hospital relations.');
  assert(goReport.localSuggestions.unsafePublicCount === 0, 'clean fixture must not have unsafe public local suggestions.');
  assert(Array.isArray(goReport.sitemap.unexpectedUrls) && goReport.sitemap.unexpectedUrls.length === 0, 'clean fixture must not have unexpected sitemap URLs.');

  const invalidOutput = `${outputDir}/invalid-report.json`;
  const invalidRun = spawnSync(process.execPath, [runnerPath, '--input', 'docs/import/fixtures/missing-first-batch-runner.fixture.json', '--output', invalidOutput], {
    cwd: root,
    encoding: 'utf8',
  });
  assert(invalidRun.status !== 0, 'missing input must fail the runner.');
  assert(!existsSync(absolute(invalidOutput)), 'missing input must not leave an output report behind.');

  await assertSnapshotUnchanged(before);
  console.log('first batch dry-run runner check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
