import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminBoundedReadState,
  PHARMACY_ADMIN_DIFF_FIELDS,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";
import {
  createPharmacyAdminReadStateStore,
  type PharmacyAdminReadStateClient,
} from "./import-pharmacy-admin-read-state-store";

const current = Object.fromEntries(
  PHARMACY_ADMIN_DIFF_FIELDS.map((field) => [field, null]),
) as Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
Object.assign(current, {
  status: "draft",
  is_active: false,
  is_featured: false,
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  projection_version: "12",
  canonical_path: "/en/om/pharmacies/store-roundtrip",
  name_en: "Store Roundtrip Pharmacy",
  metadata_source_evidence: "null",
});

const proposed: Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue> = {
  ...current,
  projection_version: "13",
};

describe("Pharmacy recovery Review persistence roundtrip", () => {
  it("does not report persist failure when PostgreSQL rewrites timestamptz text", async () => {
    const state = buildPharmacyAdminBoundedReadState({
      operation: "review",
      actorId: "00000000-0000-4000-8000-000000000001",
      entityId: "00000000-0000-4000-8000-000000000002",
      snapshotHash: "a".repeat(64),
      entityFingerprint: "b".repeat(64),
      expectedEntityVersion: "2026-07-27T00:00:00.000Z",
      createdAt: "2026-07-27T13:59:47.120Z",
      reviewedAt: "2026-07-27T13:59:47.121Z",
      expiresAt: "2026-07-27T14:14:47.120Z",
      current,
      proposed,
    });

    const databaseRow = {
      id: "00000000-0000-4000-8000-000000000003",
      actor_profile_id: state.actorId,
      entity_id: state.entityId,
      operation: state.operation,
      snapshot_hash: state.snapshotHash,
      entity_fingerprint: state.entityFingerprint,
      operation_attempt_id: state.operationAttemptId,
      idempotency_key: state.idempotencyKey,
      request_hash: state.requestHash,
      patch_hash: state.patchHash,
      operation_scope: state.operationScope,
      entity_family: state.entityFamily,
      expected_entity_version: state.expectedEntityVersion,
      current_state: current,
      proposed_state: proposed,
      blocker_codes: state.blockerCodes,
      reviewed_at: "2026-07-27 13:59:47.121+00",
      expires_at: "2026-07-27 14:14:47.120+00",
      created_at: "2026-07-27 13:59:47.120+00",
    };
    const terminal = {
      maybeSingle: vi.fn(async () => ({ data: databaseRow, error: null })),
    };
    const client = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => ({ select: vi.fn(() => terminal) })),
        select: vi.fn(() => {
          throw new Error("read query was not expected");
        }),
      })),
    } as unknown as PharmacyAdminReadStateClient;

    const store = createPharmacyAdminReadStateStore(client);
    await expect(store.persist({ state, current, proposed })).resolves.toEqual({
      id: databaseRow.id,
      state,
    });
  });
});
