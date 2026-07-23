#!/usr/bin/env node

import { spawn } from 'node:child_process';
import pg from 'pg';

const { Client } = pg;
const lockKey = 824731905;

function assert(value, message) { if (!value) throw new Error(message); }
function required(name) {
  const value = process.env[name]?.trim();
  assert(value, `${name} is required.`);
  return value;
}
function config(connectionString) {
  const parsed = new URL(connectionString);
  const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
  return {
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
    application_name: 'drmuscat-preview-migration-sync-lock',
    statement_timeout: 0,
  };
}
function runSupabase(databaseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn('supabase', ['db', 'push', '--db-url', databaseUrl, '--include-all', '--yes'], {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.stdout.resume();
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Supabase migration push exited with code ${code}. ${stderr.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]').slice(-1200)}`));
    });
  });
}

const databaseUrl = required('PREVIEW_DATABASE_URL');
const client = new Client(config(databaseUrl));
try {
  await client.connect();
  const acquired = await client.query('select pg_try_advisory_lock($1) as acquired', [lockKey]);
  assert(acquired.rows[0]?.acquired === true, 'Preview migration advisory lock is already held; refusing concurrent write.');
  console.log('Preview migration advisory lock acquired.');
  await runSupabase(databaseUrl);
  console.log('Preview migration push completed without emitting connection details.');
} finally {
  await client.query('select pg_advisory_unlock($1)', [lockKey]).catch(() => {});
  await client.end().catch(() => {});
}
