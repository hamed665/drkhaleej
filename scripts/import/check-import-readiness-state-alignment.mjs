import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  currentState: 'docs/project-state/CURRENT_STATE.md',
  matrix: 'docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md',
  readme: 'README.md',
};

const expectedCanonicalState = {
  schemaVersion: 'drkhaleej.importReadinessState.v1',
  alignedThroughPr: 954,
  runtimeBaseline: '9d0511ba6b2ff5a53e8fd857cb09273d269d602d',
  lastAligned: '2026-07-24',
  currentMigration: '0082_import_pharmacy_private_execution_audit.sql',
  currentNext: 'ROLLBACK-AUTHORITY-HARDENING',
  waves: {
    0: 'COMPLETE',
    1: 'COMPLETE',
    '2.1': 'COMPLETE',
    '2.2': 'COMPLETE',
    '3+': 'COMPLETE',
  },
  currentReservationAudit: {
    eventType: 'reservation_created',
    phase: 'reservation',
  },
  reservationCreatedImplemented: true,
};

function parseRootArgument(argv) {
  const rootIndex = argv.indexOf('--root');
  if (rootIndex === -1) return process.cwd();
  const value = argv[rootIndex + 1];
  if (!value || value.startsWith('--')) {
    throw new Error('Usage: check-import-readiness-state-alignment.mjs [--root <repository-root>]');
  }
  return path.resolve(value);
}

function bounded(value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return serialized.length > 180 ? `${serialized.slice(0, 177)}...` : serialized;
}

function fail(file, field, expected, actual) {
  throw new Error(
    `${file}: ${field} drifted; expected=${bounded(expected)}; actual=${bounded(actual ?? '<missing>')}`,
  );
}

function assertEqual(file, field, actual, expected) {
  if (actual !== expected) fail(file, field, expected, actual);
}

function stripMarkdown(value) {
  return value
    .trim()
    .replace(/^`|`$/g, '')
    .replace(/^\*\*|\*\*$/g, '')
    .trim();
}

function extractSection(file, source, heading) {
  const marker = `## ${heading}`;
  const start = source.indexOf(marker);
  if (start === -1) fail(file, `section ${heading}`, 'present', '<missing>');
  const next = source.indexOf('\n## ', start + marker.length);
  return source.slice(start, next === -1 ? source.length : next);
}

function parseTable(file, source, heading, keyColumn) {
  const section = extractSection(file, source, heading);
  const groups = [];
  let currentGroup = [];

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      currentGroup.push(line.slice(1, -1).split('|').map(stripMarkdown));
    } else if (currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  const rows = groups.find((group) => group[0]?.includes(keyColumn)) ?? [];
  if (rows.length < 3) fail(file, `${heading} table`, 'header and data rows', rows.length);

  const headers = rows[0];
  const keyIndex = headers.indexOf(keyColumn);
  if (keyIndex === -1) fail(file, `${heading} key column`, keyColumn, headers);

  const isSeparator = (row) => row.every((cell) => /^:?-{3,}:?$/.test(cell));
  const entries = new Map();
  for (const row of rows.slice(1)) {
    if (isSeparator(row)) continue;
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']));
    entries.set(row[keyIndex], record);
  }
  return entries;
}

function extractManifest(source) {
  const match = source.match(/```json import-readiness-state\s*\r?\n([\s\S]*?)\r?\n```/);
  if (!match) fail(files.roadmap, 'machine-readable alignment manifest', 'present', '<missing>');
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(files.roadmap, 'machine-readable alignment manifest JSON', 'valid JSON', error.message);
  }
}

function validateCanonicalManifest(manifest) {
  for (const field of [
    'schemaVersion',
    'alignedThroughPr',
    'runtimeBaseline',
    'lastAligned',
    'currentMigration',
    'currentNext',
    'reservationCreatedImplemented',
  ]) {
    assertEqual(files.roadmap, `manifest.${field}`, manifest[field], expectedCanonicalState[field]);
  }

  for (const [wave, status] of Object.entries(expectedCanonicalState.waves)) {
    assertEqual(files.roadmap, `manifest.waves.${wave}`, manifest.waves?.[wave], status);
  }
  for (const [field, value] of Object.entries(expectedCanonicalState.currentReservationAudit)) {
    assertEqual(
      files.roadmap,
      `manifest.currentReservationAudit.${field}`,
      manifest.currentReservationAudit?.[field],
      value,
    );
  }
}

function validateVisibleRoadmapLedger(source, manifest) {
  const statusSection = extractSection(files.roadmap, source, 'Status');
  const visibleWaves = new Map();
  const wavePattern = /^Wave\s+(0|1|2\.1|2\.2|3\+)\s+(COMPLETE|PARTIAL|OPEN)\b/gm;
  for (const match of statusSection.matchAll(wavePattern)) visibleWaves.set(match[1], match[2]);
  for (const [wave, status] of Object.entries(manifest.waves)) {
    assertEqual(files.roadmap, `visible wave ${wave}`, visibleWaves.get(wave), status);
  }

  const currentNextSection = extractSection(files.roadmap, source, 'Current next implementation');
  const currentNextMatch = currentNextSection.match(/```text\s*\r?\n([^\r\n]+)\r?\n```/);
  assertEqual(files.roadmap, 'visible current next', currentNextMatch?.[1]?.trim(), manifest.currentNext);
}

function validateBaselineTable(file, table, manifest) {
  const expectedRows = {
    'Aligned through': `PR #${manifest.alignedThroughPr}`,
    'Runtime baseline': manifest.runtimeBaseline,
    'Last aligned': manifest.lastAligned,
    'Current migration': manifest.currentMigration,
    'Current next': manifest.currentNext,
  };
  for (const [field, expected] of Object.entries(expectedRows)) {
    assertEqual(file, `${field} value`, table.get(field)?.Value, expected);
  }
}

function validateCurrentState(source, manifest) {
  const baseline = parseTable(files.currentState, source, 'Import readiness alignment', 'Field');
  validateBaselineTable(files.currentState, baseline, manifest);
  assertEqual(
    files.currentState,
    'Reservation audit event value',
    baseline.get('Reservation audit event')?.Value,
    manifest.currentReservationAudit.eventType,
  );
  assertEqual(
    files.currentState,
    'Reservation audit phase value',
    baseline.get('Reservation audit phase')?.Value,
    manifest.currentReservationAudit.phase,
  );

  const waveTable = parseTable(files.currentState, source, 'Import readiness alignment', 'Wave');
  for (const [wave, expected] of Object.entries(manifest.waves)) {
    assertEqual(files.currentState, `wave ${wave} status`, waveTable.get(wave)?.Status, expected);
  }
}

function validateMatrix(source, manifest) {
  const baseline = parseTable(files.matrix, source, 'Import readiness baseline', 'Field');
  validateBaselineTable(files.matrix, baseline, manifest);

  const capabilities = parseTable(
    files.matrix,
    source,
    'Import readiness capability mapping',
    'Capability',
  );
  const expectedCapabilities = {
    'Client-safe authorization': ['Complete', '#936'],
    'Canonical Pharmacy patch': ['Complete', '#937'],
    'Metadata/locale preservation': ['Complete', '#938'],
    'Stable operation identity': ['Complete', '#939'],
    'Persisted authorization': ['Complete', '#940'],
    'Invalidation/readback': ['Complete', '#941'],
    'Atomic reservation transaction': ['Complete', '#942, #949'],
    'Admin reserve operation': ['Complete', '#943'],
    'Reservation integrity proof': ['Complete', '#946'],
    'Reservation DB safety proof': ['Complete', '#949'],
    'Reservation audit split': ['Complete', '#950'],
    'Existing private executor handoff': ['Complete', '#953'],
    'Private Admin wiring and publish readback': ['Complete', '#954'],
    'Exact rollback recovery': ['Open', '—'],
    'Pharmacy public/index/sitemap': ['Disabled/Open', '—'],
    'AI-assisted intake': ['Planned', '—'],
    'Content/SEO Agent': ['Planned separate track', '—'],
  };

  for (const [capability, [status, evidence]] of Object.entries(expectedCapabilities)) {
    const row = capabilities.get(capability);
    assertEqual(files.matrix, `${capability} status`, row?.['Current status'], status);
    assertEqual(files.matrix, `${capability} evidence`, row?.Evidence, evidence);
  }
}

function validateReadme(source, manifest) {
  const section = extractSection(files.readme, source, 'Current project phase status');
  const required = [
    `PR #${manifest.alignedThroughPr}`,
    manifest.runtimeBaseline,
    manifest.currentMigration,
    '`0001` through `0082`',
    manifest.currentNext,
    '[`docs/project-state/CURRENT_STATE.md`](docs/project-state/CURRENT_STATE.md)',
    '[`docs/import/import-readiness-roadmap-after-933.md`](docs/import/import-readiness-roadmap-after-933.md)',
    '[`docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`](docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md)',
  ];
  for (const token of required) {
    if (!section.includes(token)) fail(files.readme, 'current status token', token, '<missing>');
  }
  if (/Database\/migration status:[^\n]*0053/.test(section)) {
    fail(files.readme, 'current migration', manifest.currentMigration, '0053 presented as current');
  }
}

const root = parseRootArgument(process.argv.slice(2));
const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, relativePath]) => [
      key,
      await readFile(path.join(root, relativePath), 'utf8'),
    ]),
  ),
);

const manifest = extractManifest(sources.roadmap);
validateCanonicalManifest(manifest);
validateVisibleRoadmapLedger(sources.roadmap, manifest);
validateCurrentState(sources.currentState, manifest);
validateMatrix(sources.matrix, manifest);
validateReadme(sources.readme, manifest);

console.log('import readiness state alignment check passed.');
