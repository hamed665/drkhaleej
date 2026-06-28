import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const docPath = 'docs/DRKHALEEJ_LOCATION_V2_STATUS.md';
const packagePath = 'package.json';

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required Location V2 status tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

if (!existsSync(resolve(projectRoot, docPath))) {
  console.error(`Missing Location V2 status document: ${docPath}`);
  process.exit(1);
}

const doc = read(docPath);
const packageJson = read(packagePath);

requireTokens(docPath, doc, [
  'DrKhaleej Location V2 Status',
  'noindex-first, fail-closed system',
  'Country -> Governorate -> Wilayat / City-level -> Area / Neighborhood',
  'Candidate composite routes are still forbidden.',
  'Required promotion sequence',
  'route readiness final gate',
  'Any PR that changes a candidate from blocked to reviewable or indexable must include:',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-v2-status-doc:validate',
  'check-location-v2-status-doc.mjs',
]);

console.log('Location V2 status document validation passed.');
