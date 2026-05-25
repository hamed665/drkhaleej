#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';

const dir = 'supabase/seed';

try {
  if (!statSync(dir).isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const sqlFiles = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();

if (sqlFiles.length > 0) {
  console.error('ERROR: Phase 2.0 does not allow seed SQL rows yet.');
  console.error(`Found SQL seed files in ${dir}: ${sqlFiles.join(', ')}`);
  console.error('Action: Remove seed SQL files; only empty seed scaffolding is allowed in Phase 2.0.');
  process.exit(1);
}

console.log('Seed protocol validated.');
console.log('No SQL seed files found, which is correct for Phase 2.0.');
