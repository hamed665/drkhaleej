#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const legacyValidator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations-taxrlsa.mjs');
const functionSearchPathValidator = path.join(repoRoot, 'scripts', 'db', 'check-security-function-search-path.mjs');
const helperSearchPathValidator = path.join(repoRoot, 'scripts', 'db', 'check-sensitive-helper-search-path.mjs');
const scheduleRlsMigrationName = '0065_schedule_appointment_rls_hardening.sql';
const functionSearchPathMigrationName = '0066_function_search_path_hardening.sql';
const helperSearchPathMigrationName = '0067_sensitive_helper_search_path_hardening.sql';
const scheduleRlsMigrationPath = path.join(migrationsDir, scheduleRlsMigrationName);
const functionSearchPathMigrationPath = path.join(migrationsDir, functionSearchPathMigrationName);
const helperSearchPathMigrationPath = path.join(migrationsDir, helperSearchPathMigrationName);
const hiddenScheduleRlsMigrationPath = path.join(migrationsDir, `.schedule-rls-${scheduleRlsMigrationName}.hidden`);
const hiddenFunctionSearchPathMigrationPath = path.join(migrationsDir, `.function-search-path-${functionSearchPathMigrationName}.hidden`);
const hiddenHelperSearchPathMigrationPath = path.join(migrationsDir, `.helper-search-path-${helperSearchPathMigrationName}.hidden`);

const currentOnlyMigrations = [
  [scheduleRlsMigrationName, scheduleRlsMigrationPath, hiddenScheduleRlsMigrationPath],
  [functionSearchPathMigrationName, functionSearchPathMigrationPath, hiddenFunctionSearchPathMigrationPath],
  [helperSearchPathMigrationName, helperSearchPathMigrationPath, hiddenHelperSearchPathMigrationPath],
];

function fail(message) {
  console.error(`ERROR: SEC-SCHEDULE-RLS-A: ${message}`);
  process.exit(1);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

function requirePattern(content, pattern, message) {
  requireCondition(pattern.test(content), message);
}

function forbidPattern(content, pattern, message) {
  requireCondition(!pattern.test(content), message);
}

function validateScheduleRlsMigration() {
  requireCondition(existsSync(scheduleRlsMigrationPath), `${scheduleRlsMigrationName} is missing.`);
  const content = readFileSync(scheduleRlsMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0065 must not seed rows.'],
    [/\bdrop\b/i, '0065 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0065 must not add public or authenticated policies.'],
    [/\bto\s+anon\b/i, '0065 must not grant anon access.'],
    [/\bto\s+authenticated\b/i, '0065 must not grant authenticated access.'],
    [/\bfor\s+insert\b/i, '0065 must not add insert policies.'],
    [/\bfor\s+update\b/i, '0065 must not add update policies.'],
    [/\bfor\s+delete\b/i, '0065 must not add delete policies.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  for (const [pattern, message] of [
    [/SEC-SCHEDULE-RLS-A: schedule and appointment table RLS hardening/i, '0065 must include the schedule RLS hardening marker.'],
    [/alter\s+table\s+public\.doctor_schedules\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on doctor_schedules.'],
    [/alter\s+table\s+public\.doctor_schedule_exceptions\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on doctor_schedule_exceptions.'],
    [/alter\s+table\s+public\.appointment_slots\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on appointment_slots.'],
  ]) {
    requirePattern(content, pattern, message);
  }
}

function validateFunctionSearchPathMigration() {
  execFileSync(process.execPath, [functionSearchPathValidator], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function validateHelperSearchPathMigration() {
  execFileSync(process.execPath, [helperSearchPathValidator], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function runLegacyValidatorWithoutCurrentOnlyMigrations() {
  for (const [migrationName, migrationPath, hiddenMigrationPath] of currentOnlyMigrations) {
    requireCondition(existsSync(migrationPath), `${migrationName} is missing before legacy validation.`);
    requireCondition(!existsSync(hiddenMigrationPath), `Hidden migration file already exists for ${migrationName}.`);
  }

  const renamedMigrations = [];
  try {
    for (const [migrationName, migrationPath, hiddenMigrationPath] of currentOnlyMigrations) {
      renameSync(migrationPath, hiddenMigrationPath);
      renamedMigrations.push([migrationName, migrationPath, hiddenMigrationPath]);
    }

    execFileSync(process.execPath, [legacyValidator], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    for (const [, migrationPath, hiddenMigrationPath] of renamedMigrations.reverse()) {
      if (existsSync(hiddenMigrationPath)) {
        renameSync(hiddenMigrationPath, migrationPath);
      }
    }
  }
}

runLegacyValidatorWithoutCurrentOnlyMigrations();
validateScheduleRlsMigration();
validateFunctionSearchPathMigration();
validateHelperSearchPathMigration();

console.log('Current migration validation passed.');
