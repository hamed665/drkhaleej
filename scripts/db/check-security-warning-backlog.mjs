#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const docPath = path.join(repoRoot, 'docs', 'security', 'supabase-warning-hardening-backlog.md');

function fail(message) {
  console.error(`ERROR: SECURITY-WARNING-BACKLOG: ${message}`);
  process.exit(1);
}

function mustHave(content, token) {
  if (!content.includes(token)) fail(`Missing required token: ${token}`);
}

if (!existsSync(docPath)) fail('Supabase warning backlog doc is missing.');
const doc = readFileSync(docPath, 'utf8');

for (const token of [
  'Supabase warning hardening backlog',
  'PR 687: function search path hardening',
  'PR 688: sensitive helper search path hardening',
  'Function execution privilege hardening',
  'Extension schema hardening',
  'Security Advisor Errors remain launch blockers.',
  'Warnings may remain during soft launch only when tracked here or in a successor security backlog.',
  'Run manual DB review for function execution privileges.',
  'Run manual DB review for extension schema placement.',
  'Re-run Supabase Security Advisor.',
  'current_profile_id()',
  'is_platform_admin()',
  'can_manage_center(uuid)',
  'can_view_audit_log(uuid)',
]) {
  mustHave(doc, token);
}

console.log('Security warning backlog check passed.');
