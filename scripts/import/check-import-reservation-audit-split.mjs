#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0081_import_pharmacy_reservation_audit_split.sql',
  executionMigration: 'supabase/migrations/0082_import_pharmacy_private_execution_audit.sql',
  contract: 'src/server/admin/import-reservation-audit-contract.ts',
  verifier: 'src/server/admin/import-persistence-readback-verifier.ts',
  verifierTest: 'src/server/admin/import-persistence-readback-verifier.test.ts',
  readback: 'src/server/admin/import-supabase-persistence-readback-client.ts',
  runtime: 'src/server/admin/import-pharmacy-private-admin-runtime-context.ts',
  action: 'src/app/admin/imports/readiness/actions.ts',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const entries = await Promise.all(
  Object.entries(files).map(async ([key, file]) => [key, await readFile(path.join(root, file), 'utf8')]),
);
const source = Object.fromEntries(entries);

for (const token of [
  'P04-A RESERVATION-AUDIT-SPLIT',
  'import_publish_audit_event_type_check',
  "'reservation_created'",
  "'drkhaleej.import.publishAudit.v2'",
  'create or replace function public.import_publish_reserve_snapshot_audit',
  'security invoker',
  'set search_path = pg_catalog, public',
  "event_type = 'execution_started'",
  "schema_version <> 'drkhaleej.import.publishAudit.v2'",
  "event_payload ->> 'phase' = 'reservation'",
  'from public, anon, authenticated',
  'to service_role',
]) assert(source.migration.toLowerCase().includes(token.toLowerCase()), `${files.migration} must include ${token}.`);

assert(
  !/'execution_started'\s*,\s*'pending'\s*,\s*p_audit_schema_version/i.test(source.migration),
  `${files.migration} must not write execution_started during reservation.`,
);
for (const forbidden of ['create policy', 'to anon', 'to authenticated']) {
  assert(!source.migration.toLowerCase().includes(forbidden), `${files.migration} must not include ${forbidden}.`);
}

for (const token of [
  'IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION',
  'drkhaleej.import.publishAudit.v2',
  'IMPORT_LEGACY_RESERVATION_AUDIT_EVENT',
  'IMPORT_RESERVATION_CREATED_AUDIT_EVENT',
  'isCompatibleReservationAudit',
  'input.phase !== "reservation"',
]) assert(source.contract.includes(token), `${files.contract} must include ${token}.`);

for (const token of [
  'isCompatibleReservationAudit',
  'schema_version: string',
  'audit_schema_version_mismatch',
  'auditSchemaVersion',
  'eventTypes: ["execution_started", "reservation_created"]',
]) assert(source.verifier.includes(token), `${files.verifier} must include ${token}.`);

for (const token of [
  'accepts the current reservation audit signature with the bumped schema version',
  'fails closed when a reservation audit uses an incompatible event and schema pairing',
  'IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION',
]) assert(source.verifierTest.includes(token), `${files.verifierTest} must cover ${token}.`);

assert(source.readback.includes('event_type,outcome,schema_version,expected_version'), `${files.readback} must select schema_version.`);
assert(source.readback.includes('schema_version: stringValue(row.schema_version)'), `${files.readback} must map schema_version.`);
assert(source.runtime.includes('auditSchemaVersion: IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION'), `${files.runtime} must use the v2 reservation audit schema.`);

for (const token of [
  'p_execution_started_audit_id',
  'legacy',
  'verified reservation audit id',
  "'execution_started'",
  "'phase', 'mutation'",
  'drkhaleej.import.publishAudit.v3',
  "event_payload ->> 'phase' = 'reservation'",
]) {
  assert(source.executionMigration.includes(token), `${files.executionMigration} must preserve the Reservation→execution boundary with ${token}.`);
}
assert(
  source.executionMigration.indexOf("event_payload ->> 'phase' = 'reservation'") <
    source.executionMigration.indexOf("'execution_started'"),
  `${files.executionMigration} must verify the Reservation audit before appending execution_started.`,
);

for (const token of [
  '"reserve_private_publish"',
  '"private_publish"',
  'runPharmacyPrivateAdminPublishOperation',
]) {
  assert(source.action.includes(token), `${files.action} must include P05 activation token ${token}.`);
}
assert(!source.action.includes('"rollback"\n] as const'), `${files.action} must keep rollback disabled until P06.`);

console.log('P04-A reservation audit split and P05 execution boundary contract passed.');
