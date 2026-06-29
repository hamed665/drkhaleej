import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const policyPath = 'docs/trust/TRUST_SOURCE_POLICY_PAGE_CONTRACT.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, token) {
  if (!source.includes(token)) throw new Error(`${policyPath} must include ${token}`);
}

const source = await readText(policyPath);

for (const token of [
  '# DrKhaleej Source Policy Page Contract',
  'Allowed page goals',
  'Required public wording boundaries',
  'Source policy',
  'Correction policy',
  'Sponsored visibility policy',
  'Structured data policy',
  'Sitemap policy',
  'LLM-facing policy',
  'Promotion requirements',
  'Stop rule',
]) {
  assertIncludes(source, token);
}

for (const token of [
  'not a healthcare provider',
  'not a regulator',
  'not an insurer',
  'not a booking guarantee',
  'not an emergency service',
  'not a diagnosis or treatment tool',
  'must not claim that every listing is officially verified',
  'must not imply ranking, endorsement, official recommendation, clinical quality, or outcome superiority',
  'must not add provider schema, review schema, rating schema, opening-hours schema, or medical claim schema',
]) {
  assertIncludes(source, token);
}

console.log('source policy contract check passed.');
