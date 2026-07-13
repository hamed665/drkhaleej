import "server-only";

import { createHash } from "node:crypto";

export const PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE = "reserve_private_publish" as const;

export type PharmacyStableOperationIdentity = {
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  operationScope: typeof PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE;
  entityFamily: "pharmacy";
  expectedEntityVersion: string;
};

export type BuildPharmacyStableOperationIdentityInput = {
  actorId: string;
  entityId: string;
  snapshotHash: string;
  entityFingerprint: string;
  expectedEntityVersion: string;
  patch: unknown;
};

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function assertNonEmpty(value: string, name: string): void {
  if (value.trim().length === 0) throw new Error(`${name}_required`);
}

function assertSha256(value: string, name: string): void {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`${name}_invalid`);
}

function deterministicUuidFromHash(hash: string): string {
  const bytes = hash.slice(0, 32).split("");
  bytes[12] = "5";
  const variant = Number.parseInt(bytes[16] ?? "0", 16);
  bytes[16] = ((variant & 0x3) | 0x8).toString(16);
  const value = bytes.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20, 32)}`;
}

export function buildPharmacyStableOperationIdentity(
  input: BuildPharmacyStableOperationIdentityInput,
): PharmacyStableOperationIdentity {
  assertNonEmpty(input.actorId, "actor_id");
  assertNonEmpty(input.entityId, "entity_id");
  assertNonEmpty(input.expectedEntityVersion, "expected_entity_version");
  assertSha256(input.snapshotHash, "snapshot_hash");
  assertSha256(input.entityFingerprint, "entity_fingerprint");

  const patchHash = sha256(input.patch);
  const identityHash = sha256({
    actorId: input.actorId,
    entityId: input.entityId,
    entityFamily: "pharmacy",
    operationScope: PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE,
    snapshotHash: input.snapshotHash,
    entityFingerprint: input.entityFingerprint,
    expectedEntityVersion: input.expectedEntityVersion,
    patchHash,
  });
  const operationAttemptId = deterministicUuidFromHash(identityHash);
  const idempotencyKey = `pharmacy:${PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE}:${operationAttemptId}`;
  const requestHash = sha256({
    operationAttemptId,
    idempotencyKey,
    actorId: input.actorId,
    entityId: input.entityId,
    entityFamily: "pharmacy",
    operationScope: PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE,
    snapshotHash: input.snapshotHash,
    entityFingerprint: input.entityFingerprint,
    expectedEntityVersion: input.expectedEntityVersion,
    patchHash,
  });

  return {
    operationAttemptId,
    idempotencyKey,
    requestHash,
    patchHash,
    operationScope: PHARMACY_PRIVATE_PUBLISH_OPERATION_SCOPE,
    entityFamily: "pharmacy",
    expectedEntityVersion: input.expectedEntityVersion,
  };
}
