import "server-only";

export const PHARMACY_ADMIN_DIFF_FIELDS = [
  "status",
  "is_active",
  "is_featured",
  "visibility",
  "index_policy",
  "sitemap_policy",
  "projection_version",
  "canonical_path",
] as const;

export type PharmacyAdminDiffField = (typeof PHARMACY_ADMIN_DIFF_FIELDS)[number];
export type PharmacyAdminBoundedValue = string | boolean | null;

export type PharmacyAdminBoundedDiffEntry = {
  field: PharmacyAdminDiffField;
  before: PharmacyAdminBoundedValue;
  after: PharmacyAdminBoundedValue;
};

export type PharmacyAdminBoundedReadState = {
  schemaVersion: "pharmacy_admin_read_state_v1";
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

export type BuildPharmacyAdminBoundedReadStateInput = {
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
  assertNonEmpty(input.snapshotHash, "snapshot_hash");
  assertNonEmpty(input.entityFingerprint, "entity_fingerprint");

  const createdAt = assertIsoDate(input.createdAt, "created_at");
  const expiresAt = assertIsoDate(input.expiresAt, "expires_at");
  if (expiresAt <= createdAt) throw new Error("expiry_not_after_creation");

  if (input.operation === "review" && !input.reviewedAt) {
    throw new Error("reviewed_at_required");
  }
  if (input.reviewedAt) {
    const reviewedAt = assertIsoDate(input.reviewedAt, "reviewed_at");
    if (reviewedAt < createdAt || reviewedAt > expiresAt) {
      throw new Error("reviewed_at_out_of_range");
    }
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
    schemaVersion: "pharmacy_admin_read_state_v1",
    operation: input.operation,
    actorId: input.actorId,
    entityId: input.entityId,
    snapshotHash: input.snapshotHash,
    entityFingerprint: input.entityFingerprint,
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
