import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sheetPath = 'docs/import/BATCH_ONE_REVIEW_SHEET.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, token) {
  if (!source.includes(token)) throw new Error(`${sheetPath} must include ${token}`);
}

const source = await readText(sheetPath);

for (const token of [
  '# DrKhaleej Batch One Review Sheet',
  'Review metadata',
  'Row counts',
  'Review counts',
  'Expected URL counts',
  'Sample checks',
  'Decision rules',
  'Final decision',
]) {
  assertIncludes(source, token);
}

for (const token of [
  'doctor',
  'pharmacy',
  'hospital',
  'missing source',
  'missing location signal',
  'missing contact or map signal',
  'country mismatch',
  'unsupported family',
  'path mismatch',
  'sitemap family mismatch',
  'Use `go` only when:',
  'Use `hold` when:',
]) {
  assertIncludes(source, token);
}

console.log('batch one review sheet check passed.');
