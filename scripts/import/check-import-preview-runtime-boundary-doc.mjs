#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsPath = 'docs/platform/DRKHALEEJ_PREVIEW_RUNTIME_BOUNDARY.md';
const docs = await readFile(path.join(root, docsPath), 'utf8');

for (const token of [
  'server-only and preview-only',
  'IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED = false',
  'Secrets are never returned or logged',
  'fail closed before client construction',
]) {
  if (!docs.includes(token)) throw new Error(`${docsPath} must include ${token}.`);
}

console.log('import preview runtime boundary documentation check passed.');
