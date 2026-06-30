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
const scheduleRlsMigrationName = '0065_schedule_appointment_rls_hardening.sql';
const scheduleRlsMigrationPath = path.join(migrationsDir, scheduleRlsMigrationName);
const hiddenScheduleRlsMigrationPath = path.join(migrationsDir, `.schedule-rls-${scheduleRlsMigrationName}.hidden`);

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

function runLegacyValidatorWithoutScheduleRlsMigration() {
  requireCondition(existsSync(scheduleRlsMigrationPath), `${scheduleRlsMigrationName} is missing before legacy validation.`);
  requireCondition(!existsSync(hiddenScheduleRlsMigrationPath), 'Hidden schedule RLS migration file already exists.');

  renameSync(scheduleRlsMigrationPath, hiddenScheduleRlsMigrationPath);
  try {
    execFileSync(process.execPath, [legacyValidator], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    if (existsSync(hiddenScheduleRlsMigrationPath)) {
      renameSync(hiddenScheduleRlsMigrationPath, scheduleRlsMigrationPath);
    }
  }
}

runLegacyValidatorWithoutScheduleRlsMigration();
validateScheduleRlsMigration();

console.log('Current migration validation passed.');
