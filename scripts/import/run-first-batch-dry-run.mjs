#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const schemaVersion = 'drkhaleej.import.batchDryRun.v1';
const requiredChecks = [
  'ci_green',
  'seo_check_green',
  'readiness_audit_zero_blockers',
  'sitemap_diff_frozen',
  'representative_profile_smoke_passed',
  'blocked_route_classes_absent',
];
const defaultCaps = {
  doctor: 50,
  pharmacy: 25,
  hospital: 10,
};

function usage() {
  return [
    'Usage:',
    '  node scripts/import/run-first-batch-dry-run.mjs --input <path> --output <path>',
    '',
    'This wrapper reads a local JSON dry-run payload and writes a dry-run report.',
    'It performs no database, network, route, sitemap, schema, or public-rendering writes.',
  ].join('\n');
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input' || arg === '--output') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      result[arg.slice(2)] = value;
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function emptyFamilySummary() {
  return {
    selectedCount: 0,
    eligibleCount: 0,
    blockedCount: 0,
    sitemapUrlCount: 0,
    sampledUrlCount: 0,
    blockers: [],
    samples: [],
  };
}

function emptyHospitalRelations() {
  return {
    totalRows: 0,
    candidateHospitalCount: 0,
    publicVisibleCount: 0,
    blockedFromPublicCount: 0,
    privateReviewCount: 0,
    hospitalSuggestionCount: 0,
    unsafePublicCount: 0,
    unsafePublicBlockers: [],
    blockedFromPublicReasons: [],
  };
}

function emptyLocalSuggestions() {
  return {
    totalRows: 0,
    publicVisibleCount: 0,
    blockedFromPublicCount: 0,
    privateReviewCount: 0,
    sourceEntitySuggestionCount: 0,
    locationClusterCount: 0,
    unsafePublicCount: 0,
    unsafePublicBlockers: [],
    blockedFromPublicReasons: [],
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeReport(input) {
  const source = isRecord(input.report) ? input.report : input;
  if (!isRecord(source)) throw new Error('Input JSON must be an object.');

  const caps = isRecord(source.caps) ? { ...defaultCaps, ...source.caps } : defaultCaps;
  const byFamily = isRecord(source.byFamily) ? source.byFamily : {};
  const sitemap = isRecord(source.sitemap)
    ? source.sitemap
    : {
        beforeUrlCount: 0,
        afterUrlCount: 0,
        importedDeltaCount: 0,
        unexpectedUrlCount: 0,
        unexpectedUrls: [],
      };
  const report = {
    schemaVersion,
    rehearsalId: typeof source.rehearsalId === 'string' ? source.rehearsalId : 'first-batch-dry-run',
    generatedAt: typeof source.generatedAt === 'string' ? source.generatedAt : new Date().toISOString(),
    commitSha: typeof source.commitSha === 'string' ? source.commitSha : null,
    decision: 'no_go',
    caps,
    checks: asArray(source.checks),
    sitemap,
    byFamily: {
      doctor: isRecord(byFamily.doctor) ? byFamily.doctor : emptyFamilySummary(),
      pharmacy: isRecord(byFamily.pharmacy) ? byFamily.pharmacy : emptyFamilySummary(),
      hospital: isRecord(byFamily.hospital) ? byFamily.hospital : emptyFamilySummary(),
    },
    hospitalRelations: isRecord(source.hospitalRelations) ? source.hospitalRelations : emptyHospitalRelations(),
    localSuggestions: isRecord(source.localSuggestions) ? source.localSuggestions : emptyLocalSuggestions(),
    notes: asArray(source.notes),
  };
  report.decision = decide(report);
  return report;
}

function hasAllRequiredChecks(checks) {
  return requiredChecks.every((key) => checks.some((check) => isRecord(check) && check.key === key && check.passed === true));
}

function familyWithinCaps(report) {
  return ['doctor', 'pharmacy', 'hospital'].every((family) => {
    const summary = report.byFamily[family];
    return asNumber(summary.selectedCount) <= asNumber(report.caps[family]) && asNumber(summary.sitemapUrlCount) <= asNumber(report.caps[family]);
  });
}

function familyHasNoBlockers(report) {
  return ['doctor', 'pharmacy', 'hospital'].every((family) => {
    const summary = report.byFamily[family];
    return asNumber(summary.blockedCount) === 0 && asArray(summary.blockers).length === 0 && asArray(summary.samples).every((sample) => isRecord(sample) && sample.passed === true);
  });
}

function decide(report) {
  if (!hasAllRequiredChecks(report.checks)) return 'no_go';
  if (asNumber(report.sitemap.unexpectedUrlCount) > 0 || asArray(report.sitemap.unexpectedUrls).length > 0) return 'no_go';
  if (!familyWithinCaps(report)) return 'no_go';
  if (!familyHasNoBlockers(report)) return 'no_go';
  if (asNumber(report.hospitalRelations.unsafePublicCount) > 0 || asArray(report.hospitalRelations.unsafePublicBlockers).length > 0) return 'no_go';
  if (asNumber(report.localSuggestions.unsafePublicCount) > 0 || asArray(report.localSuggestions.unsafePublicBlockers).length > 0) return 'no_go';
  return 'go';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.input || !args.output) throw new Error(`Both --input and --output are required.\n\n${usage()}`);

  const inputPath = path.resolve(process.cwd(), args.input);
  const outputPath = path.resolve(process.cwd(), args.output);
  const raw = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw);
  const report = normalizeReport(parsed);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Dry-run report written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
