#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync('supabase', ['--version'], { encoding: 'utf8' });

if (result.error || result.status !== 0) {
  const details = result.error?.message ?? result.stderr?.trim() ?? 'unknown error';
  console.error('ERROR: Supabase CLI is not available.');
  console.error('Action: Install Supabase CLI locally (https://supabase.com/docs/guides/cli) and ensure `supabase` is on PATH.');
  console.error(`Details: ${details}`);
  process.exit(1);
}

const version = (result.stdout || '').trim();
console.log(`Supabase CLI detected: ${version}`);
