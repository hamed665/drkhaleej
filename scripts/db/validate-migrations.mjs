#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const required = ['0001_extensions.sql', '0002_enums.sql'];
const dir = 'supabase/migrations';

const forbiddenPatterns = [
  { regex: /\bpostgis\b/i, message: 'postgis is deferred and forbidden in Phase 2.1.' },
  { regex: /\bcreate\s+table\b/i, message: 'CREATE TABLE is forbidden in Phase 2.1.' },
  { regex: /\bcreate\s+policy\b/i, message: 'CREATE POLICY is forbidden in Phase 2.1.' },
  { regex: /\benable\s+row\s+level\s+security\b/i, message: 'ENABLE ROW LEVEL SECURITY is forbidden in Phase 2.1.' },
  { regex: /\binsert\s+into\b/i, message: 'INSERT INTO is forbidden in Phase 2.1.' },
  { regex: /\bdrop\b/i, message: 'DROP statements are forbidden in Phase 2.1.' }
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
  console.error('ERROR: Phase 2.1 requires exactly these migration files:');
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

for (const file of files) {
  const content = readFileSync(`${dir}/${file}`, 'utf8');

  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(content)) {
      console.error(`ERROR: ${file} violates Phase 2.1 rule: ${rule.message}`);
      process.exit(1);
    }
  }
}

console.log('Phase 2.1 migration validation passed.');
console.log(`Validated files: ${required.join(', ')}`);
