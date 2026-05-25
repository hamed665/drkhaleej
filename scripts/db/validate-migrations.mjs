#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const required = ['0001_extensions.sql', '0002_enums.sql', '0003_profiles_auth.sql'];
const dir = 'supabase/migrations';

const forbiddenPatterns = [
  { regex: /\bpostgis\b/i, message: 'postgis is deferred and forbidden in Phase 2.2A.' },
  { regex: /\bcreate\s+policy\b/i, message: 'CREATE POLICY is forbidden in Phase 2.2A.' },
  { regex: /\benable\s+row\s+level\s+security\b/i, message: 'ENABLE ROW LEVEL SECURITY is forbidden in Phase 2.2A.' },
  { regex: /\binsert\s+into\b/i, message: 'INSERT INTO is forbidden in Phase 2.2A.' },
  { regex: /\bdrop\b/i, message: 'DROP statements are forbidden in Phase 2.2A.' }
];

const forbiddenTables = [
  'geo_countries',
  'geo_regions',
  'geo_cities',
  'geo_areas',
  'centers',
  'providers',
  'doctors',
  'doctor_practice_locations',
  'legal_documents',
  'consent_logs',
  'behavior_events',
  'sponsored_slots',
  'audit_logs'
];

try {
  if (!statSync(dir).isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();
const expectedKey = required.join('|');
const actualKey = files.join('|');

if (actualKey !== expectedKey) {
  console.error('ERROR: Phase 2.2A requires exactly these migration files:');
  required.forEach((name) => console.error(`- ${name}`));

  const missing = required.filter((name) => !files.includes(name));
  const unexpected = files.filter((name) => !required.includes(name));

  if (missing.length > 0) {
    console.error(`Missing required files: ${missing.join(', ')}`);
  }

  if (unexpected.length > 0) {
    console.error(`Unexpected SQL migration files: ${unexpected.join(', ')}`);
  }

  if (files.length === 0) {
    console.error('No SQL migration files were found.');
  }

  process.exit(1);
}

let foundProfilesTable = false;
let foundSetUpdatedAtFunction = false;
let foundProfilesUpdatedAtTrigger = false;

for (const file of files) {
  const content = readFileSync(`${dir}/${file}`, 'utf8');

  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(content)) {
      console.error(`ERROR: ${file} violates Phase 2.2A rule: ${rule.message}`);
      process.exit(1);
    }
  }

  for (const table of forbiddenTables) {
    const tableRegex = new RegExp(`\\b${table}\\b`, 'i');
    if (tableRegex.test(content)) {
      console.error(`ERROR: ${file} references forbidden table for Phase 2.2A: ${table}`);
      process.exit(1);
    }
  }

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.profiles\b/i.test(content)) {
    foundProfilesTable = true;
  }

  if (/\bcreate\s+or\s+replace\s+function\s+public\.set_updated_at\s*\(\s*\)\b/i.test(content)) {
    foundSetUpdatedAtFunction = true;
  }

  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.profiles\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) {
    foundProfilesUpdatedAtTrigger = true;
  }
}

if (!foundProfilesTable) {
  console.error('ERROR: Phase 2.2A requires CREATE TABLE public.profiles.');
  process.exit(1);
}

if (foundSetUpdatedAtFunction && !foundProfilesUpdatedAtTrigger) {
  console.error('ERROR: public.set_updated_at() is only allowed when used by a trigger on public.profiles.updated_at.');
  process.exit(1);
}

console.log('Phase 2.2A migration validation passed.');
console.log(`Validated files: ${required.join(', ')}`);
