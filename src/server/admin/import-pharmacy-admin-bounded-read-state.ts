import "server-only";

import { PHARMACY_CANONICAL_MUTATION_REVIEW_FIELDS } from "./import-pharmacy-canonical-mutation-patch";
import type { PharmacyStableOperationIdentity } from "./import-pharmacy-operation-identity";

export const PHARMACY_ADMIN_DIFF_FIELDS = [
  "status",
  "is_active",
  "is_featured",
  "visibility",
  "index_policy",
  "sitemap_policy",
  "projection_version",
  "canonical_path",
  ...PHARMACY_CANONICAL_MUTATION_REVIEW_FIELDS,
] as const;

export type PharmacyAdminDiffField = (typeof PHARMACY_ADMIN_DIFF_FIELDS)[number];
export type PharmacyAdminBoundedValue = string | boolean | null;

export type PharmacyAdminBoundedDiffEntry = {
  field: PharmacyAdminDiffField;
  before: PharmacyAdminBoundedValue;
  after: PharmacyAdminBoundedValue;
};

export type PharmacyAdminBoundedReadState = PharmacyStableOperationIdentity & {
  schemaVersion: "pharmacy_admin_read_state_v3";
  operation: "dry_run" | "review";
  actorId: string;
  entityId: string;
  snapshotHash: string;
  entityFingerprint: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt: string | null;
  diff: readonly PharmacyAdminBoundedDiffEntry[];
  blockerCodes: readonly string[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
};

export type BuildPharmacyAdminBoundedReadStateInput = PharmacyStableOperationIdentity & {
  operation: "dry_run" | "review";
  actorId: string;
  entityId: string;
  snapshotHash: string;
  entityFingerprint: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt?: string | null;
  current: Readonly<Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>>;
  proposed: Readonly<Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>>;
  blockerCodes?: readonly string[];
};

function assertNonEmpty(value: string, name: string): void {
  if (value.trim().length === 0) throw new Error(`${name}_required`);
}

function assertSha256(value: string, name: string): void {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error(`${name}_invalid`);
}

function assertUuid(value: string, name: string): void {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value)) {
    throw new Error(`${name}_invalid`);
  }
}

function assertIsoDate(value: string, name: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`${name}_invalid`);
  return timestamp;
}

export function buildPharmacyAdminBoundedReadState(
  input: BuildPharmacyAdminBoundedReadStateInput,
): PharmacyAdminBoundedReadState {
  assertNonEmpty(input.actorId, "actor_id");
  assertNonEmpty(input.entityId, "entity_id");
  assertNonEmpty(input.idempotencyKey, "idempotency_key");
  assertNonEmpty(input.expectedEntityVersion, "expected_entity_version");
  assertUuid(input.operationAttemptId, "operation_attempt_id");
  assertSha256(input.snapshotHash, "snapshot_hash");
  assertSha256(input.entityFingerprint, "entity_fingerprint");
  assertSha256(input.patchHash, "patch_hash");
  assertSha256(input.requestHash, "request_hash");
  if (input.entityFamily !== "pharmacy") throw new Error("entity_family_invalid");
  if (input.operationScope !== "reserve_private_publish") throw new Error("operation_scope_invalid");

  const createdAt = assertIsoDate(input.createdAt, "created_at");
  const expiresAt = assertIsoDate(input.expiresAt, "expires_at");
  if (expiresAt <= createdAt) throw new Error("expiry_not_after_creation");

  if (input.operation === "review" && !input.reviewedAt) throw new Error("reviewed_at_required");
  if (input.reviewedAt) {
    const reviewedAt = assertIsoDate(input.reviewedAt, "reviewed_at");
    if (reviewedAt < createdAt || reviewedAt > expiresAt) throw new Error("reviewed_at_out_of_range");
  }

  const diff = PHARMACY_ADMIN_DIFF_FIELDS.flatMap((field) => {
    const before = input.current[field];
    const after = input.proposed[field];
    return Object.is(before, after) ? [] : [{ field, before, after }];
  });
  const blockerCodes = [...new Set((input.blockerCodes ?? []).map((value) => value.trim()).filter(Boolean))]
    .sort()
    .slice(0, 20);

  return {
    schemaVersion: "pharmacy_admin_read_state_v3",
    operation: input.operation,
    actorId: input.actorId,
    entityId: input.entityId,
    snapshotHash: input.snapshotHash,
    entityFingerprint: input.entityFingerprint,
    operationAttemptId: input.operationAttemptId,
    idempotencyKey: input.idempotencyKey,
    requestHash: input.requestHash,
    patchHash: input.patchHash,
    operationScope: input.operationScope,
    entityFamily: input.entityFamily,
    expectedEntityVersion: input.expectedEntityVersion,
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
    reviewedAt: input.reviewedAt ?? null,
    diff,
    blockerCodes,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
  };
}

export function isPharmacyAdminBoundedReadStateFresh(
  state: PharmacyAdminBoundedReadState,
  now: string,
): boolean {
  const nowTimestamp = Date.parse(now);
  const expiresTimestamp = Date.parse(state.expiresAt);
  return Number.isFinite(nowTimestamp) && Number.isFinite(expiresTimestamp) && nowTimestamp < expiresTimestamp;
}
