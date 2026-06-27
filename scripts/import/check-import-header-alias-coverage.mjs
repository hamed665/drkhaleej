import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const normalizerPath = 'src/server/admin/import-row-normalizer.ts';
const contractPath = 'docs/import/drkhaleej-template-import-contract-v1.json';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSourceIncludes(source, token, context) {
  assert(source.includes(`"${token}"`), `${context} must include alias "${token}".`);
}

const normalizerSource = await readText(normalizerPath);
const contract = JSON.parse(await readText(contractPath));
const packageSource = await readText('package.json');

const requiredAliasGaps = contract.requiredAliasGaps;
assert(Array.isArray(requiredAliasGaps) && requiredAliasGaps.length >= 10, 'Contract must expose required alias coverage list.');

for (const alias of requiredAliasGaps) {
  assertSourceIncludes(normalizerSource, alias, normalizerPath);
}

for (const alias of [
  'entity_external_id',
  'doctor_slug',
  'facility_slug',
  'page_slug',
  'target_url_slug',
  'slug',
  'emergency_phone_e164',
  'direction_url',
  'directions_url',
  'service_slug',
  'related_service_slug',
  'service_code',
  'department_slug',
  'language_code',
]) {
  assertSourceIncludes(normalizerSource, alias, normalizerPath);
}

for (const behaviorToken of [
  'const explicitSlugCandidate = firstText',
  'const explicitDirectionUrl = normalizeUrl',
  'explicitDirectionUrl ?? googleMapsUrl',
  'slugify(explicitSlugCandidate ?? primaryName)',
  'email_public',
  'languages_spoken_csv',
  'source_last_checked_at',
  'source_date',
]) {
  assert(normalizerSource.includes(behaviorToken), `${normalizerPath} must preserve behavior token: ${behaviorToken}`);
}

for (const packageToken of [
  'import:alias-coverage:validate',
  'scripts/import/check-import-header-alias-coverage.mjs',
  'pnpm import:alias-coverage:validate',
]) {
  assert(packageSource.includes(packageToken), `package.json must include ${packageToken}.`);
}

console.log(`import header alias coverage check passed for ${requiredAliasGaps.length} contract aliases.`);
