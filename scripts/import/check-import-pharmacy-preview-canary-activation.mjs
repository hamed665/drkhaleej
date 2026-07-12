#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(repoRoot, 'src', 'server', 'admin', 'import-pharmacy-preview-canary-activation.ts');
const source = readFileSync(sourcePath, 'utf8');

function fail(message) {
  console.error(`ERROR: IMPORT-PUBLISH-AE: ${message}`);
  process.exit(1);
}

for (const [pattern, message] of [
  [/IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED\s*!==\s*"true"/, 'activation must require the explicit true value.'],
  [/VERCEL_ENV\s*!==\s*"preview"/, 'activation must be Preview-only.'],
  [/actorIds\.length\s*!==\s*1/, 'actor allowlist must contain exactly one entry.'],
  [/entityIds\.length\s*!==\s*1/, 'entity allowlist must contain exactly one entry.'],
  [/approvalToken\s*!==\s*expectedApprovalToken/, 'approval token equality must be enforced.'],
]) {
  if (!pattern.test(source)) fail(message);
}

for (const [pattern, message] of [
  [/VERCEL_ENV\s*===\s*"production"/, 'production activation must not be added.'],
  [/split\([^)]*\)\s*\.slice\(0\s*,\s*1\)/, 'multiple allowlist entries must not be silently truncated.'],
]) {
  if (pattern.test(source)) fail(message);
}

console.log('IMPORT-PUBLISH-AE preview canary activation check passed.');
