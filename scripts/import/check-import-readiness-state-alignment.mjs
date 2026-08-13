import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  workerRuntimeAdrGate: 'docs/import/WORKER_RUNTIME_ADR_GATE.md',
  workerRuntimeAdr: 'docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md',
  automationJobRuntime: 'docs/import/AUTOMATION_JOB_RUNTIME.md',
  currentState: 'docs/project-state/CURRENT_STATE.md',
  matrix: 'docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md',
  readme: 'README.md',
};

const expectedCanonicalState = {
  schemaVersion: 'drkhaleej.importReadinessState.v1',
  alignedThroughPr: 975,
  runtimeBaseline: 'd5632e9600902afe20046c0f71fdfa0d466d8359',
  lastAligned: '2026-08-12',
  currentMigration: '0095_import_automation_job_runtime.sql',
  currentNext: 'AUTOMATION-JOB-PREVIEW-ACTIVATION',
  waves: {
    0: 'COMPLETE',
    1: 'COMPLETE',
    '2.1': 'COMPLETE',
    '2.2': 'COMPLETE',
    '3+': 'COMPLETE',
    '4.1': 'COMPLETE',
    '4.2': 'COMPLETE',
    5: 'COMPLETE',
    6: 'COMPLETE',
    '7.1': 'COMPLETE',
    '7.2': 'COMPLETE',
    '7.3': 'COMPLETE',
    '7.4': 'COMPLETE',
    8: 'PARTIAL',
  },
  currentReservationAudit: {
    eventType: 'reservation_created',
    phase: 'reservation',
  },
  reservationCreatedImplemented: true,
};

const expectedWorkerRuntimeAdr = {
  schemaVersion: 'drkhaleej.workerRuntimeAdr.v1',
  status: 'accepted-decision-implementation-closed',
  decisionDate: '2026-08-12',
  decisionOwner: 'hamed665',
  implementationAuthorized: false,
  productionAuthorized: false,
  nextImplementation: 'AUTOMATION-JOB-RUNTIME',
  webRuntime: 'Vercel Web/Admin',
  worker: {
    provider: 'Render Background Worker',
    region: 'frankfurt',
    plan: 'Starter',
    instances: 1,
    steadyMonthlyUsd: 7,
  },
  jobControl: {
    provider: 'existing Supabase Postgres',
    workerDatabaseCredential: false,
    boundary: 'Vercel internal automation API plus transactional Postgres RPC',
  },
  identity: {
    provider: 'DrKhaleej internal service issuer',
    algorithm: 'Ed25519',
    audience: 'urn:drkhaleej:internal-automation:v1',
    maxTtlSeconds: 300,
    jtiReplayProtection: true,
  },
  storage: {
    provider: 'Supabase Storage private bucket',
    defaultRetentionDays: 30,
    maximumDisputeRetentionDays: 90,
    hardCapacityGb: 1,
  },
  observability: {
    provider: 'Sentry',
    plan: 'Developer',
    retentionDays: 30,
    monthlyUsd: 0,
  },
  notifications: {
    provider: 'Resend',
    plan: 'Free',
    applicationDailyCap: 20,
    applicationMonthlyCap: 500,
    monthlyUsd: 0,
  },
  security: {
    provider: 'GitHub public-repository secret scanning and Dependabot',
    monthlyUsd: 0,
  },
  deniedScopes: [
    'publish',
    'rollback',
    'public_promote',
    'index_promote',
    'sitemap_promote',
  ],
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

function extractWorkerRuntimeAdrManifest(source) {
  const match = source.match(/```json worker-runtime-adr\s*\r?\n([\s\S]*?)\r?\n```/);
  if (!match) fail(files.workerRuntimeAdr, 'machine-readable ADR manifest', 'present', '<missing>');
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(files.workerRuntimeAdr, 'machine-readable ADR manifest JSON', 'valid JSON', error.message);
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
  const wavePattern = /^Wave\s+(0|1|2\.1|2\.2|3\+|4\.1|4\.2|5|6|7\.1|7\.2|7\.3|7\.4|8)\s+(COMPLETE|PARTIAL|OPEN)\b/gm;
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
    'Durable rollback authority': ['Complete', '#955'],
    'Exact rollback recovery': ['Complete', '#956'],
    'Admin state machine': ['Complete', '#957'],
    'Real Admin canary': ['Complete', '#958'],
    'Registry authority audit': ['Complete', 'docs/import/registry-authority-audit.md'],
    'Registry convergence': ['Complete', 'docs/import/registry-convergence.md'],
    'Pharmacy public/noindex authority': [
      'Complete',
      'docs/import/PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md',
    ],
    'Pharmacy bilingual live noindex route': [
      'Complete',
      'docs/import/PHARMACY_BILINGUAL_LIVE_VERIFY.md',
    ],
    'Pharmacy public rollback': ['Complete', 'docs/import/PHARMACY_PUBLIC_ROLLBACK.md'],
    'Pharmacy Index promotion': ['Complete', 'docs/import/PHARMACY_INDEX_PROMOTION.md'],
    'Pharmacy Sitemap promotion': [
      'Complete',
      'docs/import/PHARMACY_SITEMAP_PROMOTION.md',
    ],
    'Intake contract convergence': [
      'Complete',
      'docs/import/INTAKE_CONTRACT_CONVERGENCE.md',
    ],
    'Source Evidence ledger': [
      'Complete',
      'docs/import/SOURCE_EVIDENCE_LEDGER.md',
    ],
    'Duplicate / geo candidate contract': [
      'Complete',
      'docs/import/DUPLICATE_GEO_CONTRACT.md',
    ],
    'Entity Candidate Pipeline': [
      'Complete',
      'docs/import/ENTITY_CANDIDATE_PIPELINE.md',
    ],
    'Entity Resolution Gate': [
      'Complete',
      'docs/import/ENTITY_RESOLUTION_GATE.md',
    ],
    'Worker Runtime ADR': [
      'Complete / implementation closed',
      'docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md',
    ],
    'Automation Job Runtime': [
      'Complete / activation closed',
      'docs/import/AUTOMATION_JOB_RUNTIME.md',
    ],
    'AI-assisted intake': [
      'Draft/Review boundary complete',
      'docs/import/INTAKE_CONTRACT_CONVERGENCE.md',
    ],
    'Content/SEO Agent': ['Planned separate track', '—'],
  };

  for (const [capability, [status, evidence]] of Object.entries(expectedCapabilities)) {
    const row = capabilities.get(capability);
    assertEqual(files.matrix, `${capability} status`, row?.['Current status'], status);
    assertEqual(files.matrix, `${capability} evidence`, row?.Evidence, evidence);
  }
}

function validateWorkerRuntimeAdrGate(source) {
  const required = [
    '# WORKER-RUNTIME-ADR',
    'Execution Phase: 9',
    'Lock Scope: 10',
    'Product Module: 6',
    'Subphase ID: `WORKER-RUNTIME-ADR`',
    '[`WORKER_RUNTIME_ARCHITECTURE_DECISION.md`](WORKER_RUNTIME_ARCHITECTURE_DECISION.md)',
    '`AUTOMATION-JOB-RUNTIME`; it is not authorized by this document',
    'No\nmigration, runtime code, dependency, secret, external resource, deployment or Production connection\nis added by this gate-completion change',
  ];

  for (const token of required) {
    if (!source.includes(token)) {
      fail(files.workerRuntimeAdrGate, 'required closed-boundary token', token, '<missing>');
    }
  }
}

function validateWorkerRuntimeAdr(source) {
  const manifest = extractWorkerRuntimeAdrManifest(source);
  const scalarFields = [
    'schemaVersion',
    'status',
    'decisionDate',
    'decisionOwner',
    'implementationAuthorized',
    'productionAuthorized',
    'nextImplementation',
    'webRuntime',
  ];
  for (const field of scalarFields) {
    assertEqual(
      files.workerRuntimeAdr,
      `manifest.${field}`,
      manifest[field],
      expectedWorkerRuntimeAdr[field],
    );
  }
  for (const group of [
    'worker',
    'jobControl',
    'identity',
    'storage',
    'observability',
    'notifications',
    'security',
  ]) {
    for (const [field, expected] of Object.entries(expectedWorkerRuntimeAdr[group])) {
      assertEqual(
        files.workerRuntimeAdr,
        `manifest.${group}.${field}`,
        manifest[group]?.[field],
        expected,
      );
    }
  }
  assertEqual(
    files.workerRuntimeAdr,
    'manifest.deniedScopes',
    JSON.stringify(manifest.deniedScopes),
    JSON.stringify(expectedWorkerRuntimeAdr.deniedScopes),
  );

  const required = [
    '# Worker Runtime Architecture Decision',
    'accepted architecture decision; implementation remains closed',
    '`AUTOMATION-JOB-RUNTIME` remains a separate pull request',
    'One Render **Background Worker**, Starter instance, in `frankfurt`',
    'The Worker receives **no**\ndatabase URL, Supabase secret/service-role key or direct Storage credential',
    'Lease duration is 60 seconds; heartbeat cadence is 20 seconds',
    'boot-unique Worker instance UUID',
    'DrKhaleej internal service issuer',
    'TTL no greater than 300 seconds',
    '`automation-raw-observations-preview`',
    'Default expiry is capture time plus 30 days',
    'at most 90 days from capture',
    'Sentry Developer is the concrete provider',
    'Resend Free; email only',
    'direct imports of `fetch`,\n`http`, `https`, socket or alternate HTTP clients are forbidden',
    '| Global automation |',
    'selected steady incremental cost is USD\n7/month',
    'two distinct boot-unique Worker process IDs under the registered Worker service identity racing\n   one job: exactly one lease succeeds',
    'No token, role, route or adapter may accept `publish`, `rollback`, `public_promote`,\n`index_promote` or `sitemap_promote`',
  ];
  for (const token of required) {
    if (!source.includes(token)) {
      fail(files.workerRuntimeAdr, 'required concrete-decision token', token, '<missing>');
    }
  }
}

function validateAutomationJobRuntime(source) {
  const required = [
    '# Automation Job Runtime',
    '`AUTOMATION-JOB-RUNTIME`',
    '`0095_import_automation_job_runtime.sql`',
    'all controls and identities default disabled',
    '`AUTOMATION-JOB-PREVIEW-ACTIVATION`',
    'Render provisioning is not performed by this PR',
    'Production remains disconnected',
  ];
  for (const token of required) {
    if (!source.includes(token)) {
      fail(files.automationJobRuntime, 'required closed-runtime token', token, '<missing>');
    }
  }
}

function validateReadme(source, manifest) {
  const section = extractSection(files.readme, source, 'Current project phase status');
  const required = [
    `PR #${manifest.alignedThroughPr}`,
    manifest.runtimeBaseline,
    manifest.currentMigration,
    '`0001` through `0095`',
    manifest.currentNext,
    '[`docs/project-state/CURRENT_STATE.md`](docs/project-state/CURRENT_STATE.md)',
    '[`docs/import/WORKER_RUNTIME_ADR_GATE.md`](docs/import/WORKER_RUNTIME_ADR_GATE.md)',
    '[`docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md`](docs/import/WORKER_RUNTIME_ARCHITECTURE_DECISION.md)',
    '[`docs/import/AUTOMATION_JOB_RUNTIME.md`](docs/import/AUTOMATION_JOB_RUNTIME.md)',
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
validateWorkerRuntimeAdrGate(sources.workerRuntimeAdrGate);
validateWorkerRuntimeAdr(sources.workerRuntimeAdr);
validateAutomationJobRuntime(sources.automationJobRuntime);
validateCurrentState(sources.currentState, manifest);
validateMatrix(sources.matrix, manifest);
validateReadme(sources.readme, manifest);

console.log('import readiness state alignment check passed.');
