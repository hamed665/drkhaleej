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
const families = ['doctor', 'pharmacy', 'hospital'];
const caps = { doctor: 50, pharmacy: 25, hospital: 10 };
const supportedLocalFamilies = ['doctor', 'pharmacy', 'hospital', 'radiology', 'dentistry', 'beauty'];
const familyAliases = {
  doctor: 'doctor',
  doctors: 'doctor',
  physician: 'doctor',
  physicians: 'doctor',
  pharmacy: 'pharmacy',
  pharmacies: 'pharmacy',
  hospital: 'hospital',
  hospitals: 'hospital',
  radiology: 'radiology',
  radiologies: 'radiology',
  imaging: 'radiology',
  diagnostic_imaging: 'radiology',
  dentistry: 'dentistry',
  dental: 'dentistry',
  dentist: 'dentistry',
  dentists: 'dentistry',
  beauty: 'beauty',
  beauty_center: 'beauty',
  beauty_centers: 'beauty',
  beauty_salon: 'beauty',
  beauty_salons: 'beauty',
};

function usage() {
  return [
    'Usage:',
    '  node scripts/import/transform-first-batch-csv-to-dry-run-json.mjs --input <csv> --output <json> [--checks passed|failed] [--rehearsal-id <id>] [--generated-at <iso>] [--commit-sha <sha>]',
    '',
    'This transformer reads a local CSV template and writes a local dry-run JSON input for the runner.',
    'It performs no database, network, route, sitemap, schema, migration, or public-rendering writes.',
  ].join('\n');
}

function parseArgs(argv) {
  const result = { checks: 'failed' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    if (['--input', '--output', '--checks', '--rehearsal-id', '--generated-at', '--commit-sha'].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      result[arg.slice(2)] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (result.checks !== 'passed' && result.checks !== 'failed') throw new Error('--checks must be passed or failed.');
  return result;
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      row.push(field);
      field = '';
      if (char === '\r' && next === '\n') index += 1;
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (inQuotes) throw new Error('CSV contains an unterminated quoted field.');
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  if (rows.length === 0) throw new Error('CSV must include a header row.');

  const headers = rows.shift().map((header) => header.trim());
  if (headers.length === 0 || headers.some((header) => header.length === 0)) throw new Error('CSV header row must not contain empty headers.');

  return rows.map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`);
    }
    const record = {};
    headers.forEach((header, columnIndex) => {
      record[header] = values[columnIndex] ?? '';
    });
    return record;
  });
}

function cleanText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function value(row, ...keys) {
  for (const key of keys) {
    const cleaned = cleanText(row[key]);
    if (cleaned !== null) return cleaned;
  }
  return null;
}

function booleanValue(raw) {
  if (typeof raw !== 'string') return false;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === 'yes' || normalized === '1') return true;
  return false;
}

function normalizeFamily(raw) {
  const cleaned = cleanText(raw);
  if (cleaned === null) return null;
  return familyAliases[cleaned.toLowerCase()] ?? cleaned;
}

function canonicalPath(family, locale, slug) {
  if (family === 'doctor') return `/${locale}/om/doctor/${slug}`;
  if (family === 'pharmacy') return `/${locale}/om/pharmacies/${slug}`;
  if (family === 'hospital') return `/${locale}/om/hospitals/${slug}`;
  return null;
}

function isSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isSafeCanonical(family, canonical) {
  if (family === 'doctor') return /^\/(en|ar)\/om\/doctor\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonical);
  if (family === 'pharmacy') return /^\/(en|ar)\/om\/pharmacies\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonical);
  if (family === 'hospital') return /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonical);
  return false;
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

function blocker(row, family, reason, notes) {
  const locale = value(row, 'locale') ?? 'en';
  const slug = value(row, 'slug') ?? value(row, 'candidate_key') ?? value(row, 'candidateKey');
  const canonical = value(row, 'canonical_path', 'canonicalPath') ?? (slug ? canonicalPath(family, locale, slug) : null);
  return {
    family: families.includes(family) ? family : 'doctor',
    reason,
    queueId: value(row, 'queue_id', 'queueId') ?? value(row, 'candidate_key', 'candidateKey'),
    candidateId: value(row, 'candidate_key', 'candidateKey'),
    canonicalPath: canonical,
    notes,
  };
}

function candidateBlockers(row) {
  const normalizedFamily = normalizeFamily(value(row, 'family', 'entity_type', 'entityType'));
  const family = families.includes(normalizedFamily) ? normalizedFamily : null;
  const result = [];
  const candidateKey = value(row, 'candidate_key', 'candidateKey');
  const displayName = value(row, 'display_name', 'displayName', 'name', 'nameEn');
  const locale = value(row, 'locale') ?? 'en';
  const slug = value(row, 'slug') ?? candidateKey;
  const canonical = value(row, 'canonical_path', 'canonicalPath') ?? (family && slug ? canonicalPath(family, locale, slug) : null);

  if (family === null) result.push(blocker(row, 'doctor', 'unexpected_route_class', 'Candidate family must be doctor, pharmacy, or hospital.'));
  if (candidateKey === null || displayName === null) result.push(blocker(row, family ?? 'doctor', 'candidate_missing', 'Candidate key and display name are required.'));
  if (value(row, 'area') === null || value(row, 'governorate') === null) result.push(blocker(row, family ?? 'doctor', 'geo_missing', 'Candidate area and governorate are required.'));
  if (value(row, 'source_name', 'sourceName') === null && value(row, 'source_url', 'sourceUrl') === null) {
    result.push(blocker(row, family ?? 'doctor', 'source_missing', 'Candidate source name or source URL is required.'));
  }
  if (value(row, 'last_checked_at', 'lastCheckedAt') === null) result.push(blocker(row, family ?? 'doctor', 'source_missing', 'Candidate last checked date is required.'));
  if (value(row, 'contact_or_map_signal', 'contactOrMapSignal') === null) result.push(blocker(row, family ?? 'doctor', 'contact_or_map_missing', 'Candidate contact or map signal is required.'));
  if (slug === null || !isSafeSlug(slug) || canonical === null || !isSafeCanonical(family, canonical)) {
    result.push(blocker(row, family ?? 'doctor', 'canonical_unsafe', 'Candidate slug and canonical path must be public-safe.'));
  }

  return result;
}

function rowType(row) {
  return (value(row, 'row_type', 'rowType', 'type') ?? '').toLowerCase();
}

function qaStatus(row) {
  return (value(row, 'qa_status', 'qaStatus') ?? '').toLowerCase();
}

function buildFamilySummaries(rows) {
  const byFamily = Object.fromEntries(families.map((family) => [family, emptyFamilySummary()]));
  const candidateRows = rows.filter((row) => rowType(row) === 'candidate' && qaStatus(row) === 'selected');
  const blockedCandidateKeys = new Set();

  for (const row of candidateRows) {
    const normalizedFamily = normalizeFamily(value(row, 'family', 'entity_type', 'entityType'));
    const family = families.includes(normalizedFamily) ? normalizedFamily : 'doctor';
    const summary = byFamily[family];
    summary.selectedCount += 1;
    summary.sitemapUrlCount += 1;
    const blockers = candidateBlockers(row);
    if (blockers.length > 0) {
      summary.blockers.push(...blockers);
      const candidateKey = value(row, 'candidate_key', 'candidateKey');
      if (candidateKey !== null) blockedCandidateKeys.add(candidateKey);
    }
  }

  for (const family of families) {
    const summary = byFamily[family];
    summary.blockedCount = summary.blockers.length;
    summary.eligibleCount = rows.filter((row) => {
      const normalizedFamily = normalizeFamily(value(row, 'family', 'entity_type', 'entityType'));
      const candidateKey = value(row, 'candidate_key', 'candidateKey');
      return rowType(row) === 'candidate' && qaStatus(row) === 'selected' && normalizedFamily === family && candidateKey !== null && !blockedCandidateKeys.has(candidateKey);
    }).length;
  }

  return byFamily;
}

function candidateKeyMap(rows) {
  const keys = Object.fromEntries(supportedLocalFamilies.map((family) => [family, new Set()]));
  for (const row of rows) {
    if (rowType(row) !== 'candidate' || qaStatus(row) !== 'selected') continue;
    const family = normalizeFamily(value(row, 'family', 'entity_type', 'entityType'));
    const candidateKey = value(row, 'candidate_key', 'candidateKey');
    if (supportedLocalFamilies.includes(family) && candidateKey !== null) keys[family].add(candidateKey);
  }
  return keys;
}

function sameLocation(row) {
  const sourceArea = value(row, 'source_area', 'sourceArea')?.toLowerCase() ?? null;
  const sourceGovernorate = value(row, 'source_governorate', 'sourceGovernorate')?.toLowerCase() ?? null;
  const targetArea = value(row, 'target_area', 'targetArea', 'area')?.toLowerCase() ?? null;
  const targetGovernorate = value(row, 'target_governorate', 'targetGovernorate', 'governorate')?.toLowerCase() ?? null;
  return sourceArea !== null && sourceGovernorate !== null && targetArea !== null && targetGovernorate !== null && sourceArea === targetArea && sourceGovernorate === targetGovernorate;
}

function relationNeedsReview(row) {
  const status = value(row, 'relation_status', 'relationStatus', 'status')?.toLowerCase() ?? null;
  return booleanValue(value(row, 'requires_review', 'requiresReview') ?? '') || (status !== null && status !== 'active' && status !== 'approved');
}

function localSuggestionBlocker(row, reason, notes) {
  return {
    reason,
    sourceFamily: normalizeFamily(value(row, 'source_family', 'sourceFamily')),
    sourceKey: value(row, 'source_key', 'sourceKey'),
    sourceArea: value(row, 'source_area', 'sourceArea'),
    sourceGovernorate: value(row, 'source_governorate', 'sourceGovernorate'),
    targetFamily: normalizeFamily(value(row, 'target_family', 'targetFamily', 'entity_type', 'entityType', 'family')),
    targetKey: value(row, 'target_key', 'targetKey', 'candidate_key', 'candidateKey', 'slug'),
    targetArea: value(row, 'target_area', 'targetArea', 'area'),
    targetGovernorate: value(row, 'target_governorate', 'targetGovernorate', 'governorate'),
    targetName: value(row, 'target_name', 'targetName', 'display_name', 'displayName', 'name', 'nameEn'),
    sourceName: value(row, 'source_name', 'sourceName'),
    sourceUrl: value(row, 'source_url', 'sourceUrl', 'url'),
    notes,
  };
}

function localSuggestionBlockers(row, keys) {
  const result = [];
  const sourceFamily = normalizeFamily(value(row, 'source_family', 'sourceFamily'));
  const targetFamily = normalizeFamily(value(row, 'target_family', 'targetFamily', 'entity_type', 'entityType', 'family'));
  const sourceKey = value(row, 'source_key', 'sourceKey');
  const targetKey = value(row, 'target_key', 'targetKey', 'candidate_key', 'candidateKey', 'slug');

  if (!supportedLocalFamilies.includes(sourceFamily) || !supportedLocalFamilies.includes(targetFamily)) {
    result.push(localSuggestionBlocker(row, 'unsupported_family', 'Local suggestion family must be supported before public display.'));
  }
  if (sourceKey === null || !keys[sourceFamily]?.has(sourceKey)) {
    result.push(localSuggestionBlocker(row, 'source_candidate_missing', 'Source entity must exist in the dry-run candidate key map.'));
  }
  if (targetKey === null || !keys[targetFamily]?.has(targetKey)) {
    result.push(localSuggestionBlocker(row, 'target_candidate_missing', 'Target entity must exist in the dry-run candidate key map.'));
  }
  if (sourceFamily === targetFamily && sourceKey !== null && targetKey !== null && sourceKey === targetKey) {
    result.push(localSuggestionBlocker(row, 'same_entity_self_link', 'Local suggestion must not point an entity page back to itself.'));
  }
  if (value(row, 'target_name', 'targetName', 'display_name', 'displayName', 'name', 'nameEn') === null) {
    result.push(localSuggestionBlocker(row, 'target_name_missing', 'Target display name is required before public local suggestion.'));
  }
  if (!sameLocation(row)) {
    result.push(localSuggestionBlocker(row, 'location_mismatch', 'Source and target must share the same area and governorate before public local suggestion.'));
  }
  if (value(row, 'source_name', 'sourceName') === null && value(row, 'source_url', 'sourceUrl', 'url') === null) {
    result.push(localSuggestionBlocker(row, 'source_missing', 'Local suggestion source name or URL is required before public display.'));
  }
  if (value(row, 'last_checked_at', 'lastCheckedAt', 'last_verified_date', 'lastVerifiedDate') === null) {
    result.push(localSuggestionBlocker(row, 'last_checked_missing', 'Local suggestion last checked date is required before public display.'));
  }
  const confidence = value(row, 'confidence')?.toLowerCase() ?? null;
  if (confidence !== 'high' && confidence !== 'medium') {
    result.push(localSuggestionBlocker(row, 'confidence_unsupported', 'Local suggestion confidence must be high or medium before public display.'));
  }
  if (relationNeedsReview(row)) {
    result.push(localSuggestionBlocker(row, 'ambiguous_review_required', 'Local suggestion is marked for review or has an unsupported status.'));
  }

  return result;
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

function buildLocalSuggestions(rows, keys) {
  const summary = emptyLocalSuggestions();
  const sourceEntities = new Set();
  const clusters = new Set();

  for (const row of rows.filter((candidate) => rowType(candidate) === 'local_suggestion')) {
    summary.totalRows += 1;
    const blockers = localSuggestionBlockers(row, keys);
    const publicVisible = booleanValue(value(row, 'public_visible', 'publicVisible') ?? '');
    const sourceFamily = normalizeFamily(value(row, 'source_family', 'sourceFamily'));
    const sourceKey = value(row, 'source_key', 'sourceKey');
    const sourceArea = value(row, 'source_area', 'sourceArea')?.toLowerCase() ?? null;
    const sourceGovernorate = value(row, 'source_governorate', 'sourceGovernorate')?.toLowerCase() ?? null;

    if (publicVisible && blockers.length === 0) {
      summary.publicVisibleCount += 1;
      if (sourceFamily && sourceKey) sourceEntities.add(`${sourceFamily}:${sourceKey}`);
      if (sourceArea && sourceGovernorate) clusters.add(`${sourceGovernorate}:${sourceArea}`);
      continue;
    }
    if (publicVisible && blockers.length > 0) {
      summary.unsafePublicCount += 1;
      summary.unsafePublicBlockers.push(...blockers);
      continue;
    }
    if (!publicVisible && blockers.length === 0) {
      summary.privateReviewCount += 1;
      continue;
    }
    summary.blockedFromPublicCount += 1;
    summary.blockedFromPublicReasons.push(...blockers);
  }

  summary.sourceEntitySuggestionCount = sourceEntities.size;
  summary.locationClusterCount = clusters.size;
  return summary;
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

function hospitalRelationBlocker(row, reason, notes) {
  return {
    reason,
    hospitalKey: value(row, 'hospital_key', 'hospitalKey', 'source_key', 'sourceKey'),
    doctorKey: value(row, 'doctor_key', 'doctorKey', 'target_key', 'targetKey'),
    doctorName: value(row, 'doctor_name', 'doctorName', 'doctor_name_en', 'name', 'nameEn'),
    sourceUrl: value(row, 'source_url', 'sourceUrl', 'url'),
    notes,
  };
}

function hospitalRelationBlockers(row, hospitalKeys) {
  const result = [];
  const hospitalKey = value(row, 'hospital_key', 'hospitalKey', 'source_key', 'sourceKey');
  if (hospitalKey === null || !hospitalKeys.has(hospitalKey)) result.push(hospitalRelationBlocker(row, 'hospital_mismatch', 'Relation hospital key does not match selected hospital candidates.'));
  if (value(row, 'doctor_name', 'doctorName', 'doctor_name_en', 'name', 'nameEn') === null) result.push(hospitalRelationBlocker(row, 'doctor_name_missing', 'Doctor display name is required before public suggestion.'));
  if (!booleanValue(value(row, 'branch_verified', 'branchVerified') ?? '')) result.push(hospitalRelationBlocker(row, 'branch_not_verified', 'Hospital branch relationship is not verified.'));
  if (value(row, 'source_url', 'sourceUrl', 'url') === null) result.push(hospitalRelationBlocker(row, 'source_missing', 'Relation source URL is required before public suggestion.'));
  if (value(row, 'last_checked_at', 'lastCheckedAt', 'last_verified_date', 'lastVerifiedDate') === null) result.push(hospitalRelationBlocker(row, 'last_checked_missing', 'Relation last checked date is required before public suggestion.'));
  const confidence = value(row, 'confidence')?.toLowerCase() ?? null;
  if (confidence !== 'high' && confidence !== 'medium') result.push(hospitalRelationBlocker(row, 'confidence_unsupported', 'Relation confidence must be high or medium before public suggestion.'));
  if (relationNeedsReview(row)) result.push(hospitalRelationBlocker(row, 'ambiguous_review_required', 'Relation is marked for review or has an unsupported status.'));
  return result;
}

function buildHospitalRelations(rows, keys) {
  const summary = emptyHospitalRelations();
  const candidateHospitalsWithRows = new Set();
  const hospitalsWithPublicSuggestions = new Set();
  const hospitalKeys = keys.hospital;

  for (const row of rows.filter((candidate) => rowType(candidate) === 'hospital_relation')) {
    summary.totalRows += 1;
    const hospitalKey = value(row, 'hospital_key', 'hospitalKey', 'source_key', 'sourceKey');
    if (hospitalKey !== null && hospitalKeys.has(hospitalKey)) candidateHospitalsWithRows.add(hospitalKey);
    const blockers = hospitalRelationBlockers(row, hospitalKeys);
    const publicVisible = booleanValue(value(row, 'public_visible', 'publicVisible') ?? '');

    if (publicVisible && blockers.length === 0) {
      summary.publicVisibleCount += 1;
      if (hospitalKey !== null) hospitalsWithPublicSuggestions.add(hospitalKey);
      continue;
    }
    if (publicVisible && blockers.length > 0) {
      summary.unsafePublicCount += 1;
      summary.unsafePublicBlockers.push(...blockers);
      continue;
    }
    if (!publicVisible && blockers.length === 0) {
      summary.privateReviewCount += 1;
      continue;
    }
    summary.blockedFromPublicCount += 1;
    summary.blockedFromPublicReasons.push(...blockers);
  }

  summary.candidateHospitalCount = candidateHospitalsWithRows.size;
  summary.hospitalSuggestionCount = hospitalsWithPublicSuggestions.size;
  return summary;
}

function buildChecks(mode) {
  return requiredChecks.map((key) => ({ key, passed: mode === 'passed', notes: mode === 'passed' ? null : 'External check status was not provided to the CSV transformer.' }));
}

function buildReportInput(rows, args) {
  const byFamily = buildFamilySummaries(rows);
  const selectedCount = families.reduce((total, family) => total + byFamily[family].selectedCount, 0);
  const keys = candidateKeyMap(rows);
  return {
    schemaVersion,
    rehearsalId: args['rehearsal-id'] ?? 'first-batch-csv-transform',
    generatedAt: args['generated-at'] ?? new Date().toISOString(),
    commitSha: args['commit-sha'] ?? null,
    caps,
    checks: buildChecks(args.checks),
    sitemap: {
      beforeUrlCount: 0,
      afterUrlCount: selectedCount,
      importedDeltaCount: selectedCount,
      unexpectedUrlCount: 0,
      unexpectedUrls: [],
    },
    byFamily,
    hospitalRelations: buildHospitalRelations(rows, keys),
    localSuggestions: buildLocalSuggestions(rows, keys),
    notes: [
      'Generated from a local CSV template by the first-batch transformer.',
      'No database, network, route, sitemap, schema, migration, or public-rendering writes were performed.',
    ],
  };
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
  const csv = await readFile(inputPath, 'utf8');
  const rows = parseCsv(csv);
  const reportInput = buildReportInput(rows, args);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(reportInput, null, 2)}\n`, 'utf8');
  console.log(`Dry-run JSON input written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
