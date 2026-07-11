#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = "src/server/admin/import-reservation-recovery.ts";
const testPath = "src/server/admin/import-reservation-recovery.test.ts";
const auditPath = "scripts/import/check-import-publish-readiness-audit.mjs";

const source = await readFile(path.join(root, sourcePath), "utf8");
const test = await readFile(path.join(root, testPath), "utf8");
const audit = await readFile(path.join(root, auditPath), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  'import "server-only"',
  "IMPORT_RESERVATION_RECOVERY_ENABLED = false as const",
  "recoverExpiredImportReservation",
  'environment !== "preview"',
  'status !== "reserved"',
  'status !== "in_progress"',
  'outcome: "failed"',
  "persistTerminalResult",
  "snapshotPreserved: true",
  "entityMutationAllowed: false",
  "automaticRetryAllowed: false",
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  "reservation_not_expired",
  "reservation_identity_mismatch",
  "entity_version_changed",
  "terminal_persistence_failed",
]) {
  assert(source.includes(blocker), `${sourcePath} must include ${blocker}.`);
}

for (const forbidden of [
  "runReservationSnapshotAuditTransaction(",
  "setTimeout(",
  "setInterval(",
  "entityMutationAllowed: true",
  "automaticRetryAllowed: true",
  'environment === "production"',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

for (const phrase of [
  "marks an expired reservation failed while preserving snapshot and entity",
  "does not recover a reservation before expiry",
  "fails closed when the entity version changed",
  "replays an existing terminal failure without another write",
  "blocks production and non-allowlisted actors",
]) {
  assert(test.includes(phrase), `${testPath} must cover: ${phrase}.`);
}

assert(
  audit.includes("import './check-import-reservation-recovery.mjs';"),
  "publish readiness audit must chain reservation recovery validation.",
);

console.log("import reservation recovery check passed.");
