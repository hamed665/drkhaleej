import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = process.cwd();
const scriptPath = fileURLToPath(new URL('./check-registry-authority-audit.mjs', import.meta.url));
const auditPath = 'docs/import/registry-authority-audit.md';
const fixtureFiles = [
  auditPath,
  'docs/import/import-readiness-roadmap-after-933.md',
  'src/server/admin/import-entity-domain.ts',
  'src/server/admin/imports.ts',
  'src/server/admin/import-provider-authority-adapter.ts',
  'src/lib/catalog/public-entity-family-registry.ts',
  'src/lib/catalog/public-provider-route-resolver.ts',
  'src/lib/catalog/public-eligible-queries.ts',
  'supabase/migrations/0061_import_staging_foundation.sql',
  'src/lib/catalog/public-provider-projection.ts',
  'src/server/admin/import-seo-profile-contract.ts',
  'src/server/admin/import-schema-generator.ts',
  'src/server/admin/import-link-rule-matrix.ts',
  'src/server/admin/import-sitemap-eligibility-2026.ts',
  'src/server/admin/import-sitemap-inclusion.ts',
  'src/server/public/import-sitemap.ts',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
];

async function seedFixture(root) {
  for (const relativePath of fixtureFiles) {
    await cp(path.join(repositoryRoot, relativePath), path.join(root, relativePath), {
      recursive: true,
    });
  }
}

async function runValidator(root) {
  return execFileAsync(process.execPath, [scriptPath, '--root', root], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

async function expectFailure(root, testCase) {
  await seedFixture(root);
  const targetPath = path.join(root, auditPath);
  const source = await readFile(targetPath, 'utf8');
  const mutated = source.replace(testCase.from, testCase.to);
  if (mutated === source) throw new Error(`${testCase.label}: test mutation did not apply.`);
  await writeFile(targetPath, mutated);

  try {
    await runValidator(root);
    throw new Error(`${testCase.label}: validator unexpectedly accepted drift.`);
  } catch (error) {
    if (error.message.includes('unexpectedly accepted drift')) throw error;
    const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
    if (!output.includes(testCase.expectedError)) {
      throw new Error(
        `${testCase.label}: expected error containing ${testCase.expectedError}; output=${output.slice(0, 500)}`,
      );
    }
  }
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'drkhaleej-registry-audit-'));

try {
  await seedFixture(temporaryRoot);
  await runValidator(temporaryRoot);

  for (const testCase of [
    {
      label: 'missing entity coverage',
      from: '    ["doctor", "doctor", "supported", "doctor", "supported", "doctors", "supported", "supported", "supported", "supported", "doctors", "supported"],\n',
      to: '',
      expectedError: 'entity coverage drifted',
    },
    {
      label: 'disabled route promoted',
      from: '["pharmacy", "pharmacy", "supported", "pharmacy", "disabled", "centers"',
      to: '["pharmacy", "pharmacy", "supported", "pharmacy", "supported", "centers"',
      expectedError: 'pharmacy.routeStatus must be disabled',
    },
    {
      label: 'unsupported alias softened',
      from: '["AUTH-004", "unsupported"',
      to: '["AUTH-004", "planned"',
      expectedError: 'AUTH-004 must remain unsupported',
    },
    {
      label: 'four-axis mapping drift',
      from: '"productModule": 18',
      to: '"productModule": 6',
      expectedError: 'canonical four-axis mapping drifted',
    },
    {
      label: 'coupled promotion finding softened',
      from: '["AUTH-007", "disabled"',
      to: '["AUTH-007", "planned"',
      expectedError: 'AUTH-007 must remain disabled',
    },
    {
      label: 'family fallback finding softened',
      from: '["AUTH-008", "unsupported"',
      to: '["AUTH-008", "planned"',
      expectedError: 'AUTH-008 must remain unsupported',
    },
    {
      label: 'unknown public family',
      from: '["lab", "lab", "supported", "lab"',
      to: '["lab", "ghost_family", "supported", "lab"',
      expectedError: 'lab references unknown public family ghost_family',
    },
  ]) {
    await expectFailure(temporaryRoot, testCase);
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log('registry authority audit mutation tests passed.');
