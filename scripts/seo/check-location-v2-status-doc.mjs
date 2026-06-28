import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const statusDocPath = 'docs/DRKHALEEJ_LOCATION_V2_STATUS.md';
const closeoutDocPath = 'docs/DRKHALEEJ_LOCATION_V2_CLOSEOUT_CHECKLIST.md';
const packagePath = 'package.json';

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireDocument(relativePath, label) {
  if (!existsSync(resolve(projectRoot, relativePath))) {
    console.error(`Missing ${label}: ${relativePath}`);
    process.exit(1);
  }
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required Location V2 documentation tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

requireDocument(statusDocPath, 'Location V2 status document');
requireDocument(closeoutDocPath, 'Location V2 closeout checklist');

const statusDoc = read(statusDocPath);
const closeoutDoc = read(closeoutDocPath);
const packageJson = read(packagePath);

requireTokens(statusDocPath, statusDoc, [
  'DrKhaleej Location V2 Status',
  'noindex-first, fail-closed system',
  'Country -> Governorate -> Wilayat / City-level -> Area / Neighborhood',
  'Candidate composite routes are still forbidden.',
  'Required promotion sequence',
  'route readiness final gate',
  'Any PR that changes a candidate from blocked to reviewable or indexable must include:',
]);

requireTokens(closeoutDocPath, closeoutDoc, [
  'DrKhaleej Location V2 Closeout Checklist',
  'Phase status',
  'Do not touch yet',
  'Required before data/import work',
  'Required before any candidate route PR',
  'Safe next phase',
  'No candidate page becomes reviewable or indexable',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-v2-status-doc:validate',
  'check-location-v2-status-doc.mjs',
]);

console.log('Location V2 documentation validation passed.');
