#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const seedDir = path.join(repoRoot, 'supabase', 'seed');
const packageJsonPath = path.join(repoRoot, 'package.json');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function walkForSql(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const sqlFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sqlFiles.push(...walkForSql(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) {
      sqlFiles.push(path.relative(repoRoot, fullPath));
    }
  }

  return sqlFiles;
}

if (!statSync(seedDir).isDirectory()) {
  fail(`Missing seed directory: ${seedDir}`);
}

const topLevelEntries = readdirSync(seedDir, { withFileTypes: true });
for (const entry of topLevelEntries) {
  if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) {
    fail(`Top-level seed SQL file is not allowed: supabase/seed/${entry.name}`);
  }
}

const allSqlUnderSeed = walkForSql(seedDir);
if (allSqlUnderSeed.length > 0) {
  fail(`Seed SQL files found under supabase/seed: ${allSqlUnderSeed.join(', ')}`);
}

const packageJson = readFileSync(packageJsonPath, 'utf8');
if (/Seed test placeholder/i.test(packageJson)) {
  fail('Placeholder string "Seed test placeholder" still present in package.json.');
}

console.log('✅ Seed static harness checks passed: no seed SQL files and no seed placeholder script text remain.');
