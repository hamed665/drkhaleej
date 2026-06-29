import { readFile } from 'node:fs/promises';
import path from 'node:path';

const docPath = 'docs/observability/RUNTIME_BOUNDARY.md';
const source = await readFile(path.join(process.cwd(), docPath), 'utf8');

for (const token of [
  '# DrKhaleej Runtime Boundary',
  'Current state',
  'Allowed first runtime step',
  'Blocked first runtime step',
  'Allowed payload shape',
  'Decision rule',
  'Future promotion path',
  'Stop rule',
]) {
  if (!source.includes(token)) throw new Error(`${docPath} must include ${token}`);
}

console.log('runtime boundary note check passed.');
