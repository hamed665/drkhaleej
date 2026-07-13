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
  canonical_path: "/en/om/pharmacies/example",
  name_en: "Example Pharmacy",
  default_country: "om",
  default_locale: "en",
  metadata_source_evidence: "null",
});

const proposed: Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue> = {
  ...current,
  projection_version: "13",
};

function makeState(operation: "dry_run" | "review" = "dry_run") {
  return buildPharmacyAdminBoundedReadState({
    operation,
    actorId: "admin-1",
    entityId: "pharmacy-1",
    snapshotHash: "a".repeat(64),
    entityFingerprint: "b".repeat(64),
    createdAt: "2026-07-13T00:00:00.000Z",
    expiresAt: "2026-07-13T00:15:00.000Z",
    reviewedAt: operation === "review" ? "2026-07-13T00:05:00.000Z" : null,
    current,
    proposed,
    blockerCodes: ["source_review"],
  });
}

function makeRow(state = makeState()) {
  return {
    id: "state-1",
    actor_profile_id: state.actorId,
    entity_id: state.entityId,
    operation: state.operation,
    snapshot_hash: state.snapshotHash,
    entity_fingerprint: state.entityFingerprint,
    current_state: current,
    proposed_state: proposed,
    blocker_codes: state.blockerCodes,
    reviewed_at: state.reviewedAt,
    expires_at: state.expiresAt,
    created_at: state.createdAt,
  };
}

function createClient(row: Record<string, unknown> | null, error: { message?: string } | null = null) {
  const terminal = { maybeSingle: vi.fn(async () => ({ data: row, error })) };
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => terminal),
    maybeSingle: terminal.maybeSingle,
  };
  const client = {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({ select: vi.fn(() => terminal) })),
      select: vi.fn(() => chain),
    })),
  } as unknown as PharmacyAdminReadStateClient;
  return { client, terminal };
}

describe("Pharmacy Admin bounded read state store", () => {
  it("persists and reads back only a valid bounded state", async () => {
    const state = makeState();
    const { client } = createClient(makeRow(state));
    const store = createPharmacyAdminReadStateStore(client);

    const persisted = await store.persist({ state, current, proposed });

    expect(persisted).toEqual({ id: "state-1", state });
    expect(client.from).toHaveBeenCalledWith("import_pharmacy_admin_read_states");
  });

  it("rejects stale readback and malformed rows", async () => {
    const valid = createClient(makeRow());
    const validStore = createPharmacyAdminReadStateStore(valid.client);
    await expect(
      validStore.readLatestFresh({
        actorId: "admin-1",
        entityId: "pharmacy-1",
        operation: "dry_run",
        now: "2026-07-13T00:15:00.000Z",
      }),
    ).resolves.toBeNull();

    const malformed = createClient({ ...makeRow(), proposed_state: { projection_version: { unsafe: true } } });
    const malformedStore = createPharmacyAdminReadStateStore(malformed.client);
    await expect(
      malformedStore.readLatestFresh({
        actorId: "admin-1",
        entityId: "pharmacy-1",
        operation: "dry_run",
        now: "2026-07-13T00:10:00.000Z",
      }),
    ).resolves.toBeNull();
  });

  it("fails closed on database errors", async () => {
    const { client } = createClient(null, { message: "db unavailable" });
    const store = createPharmacyAdminReadStateStore(client);
    await expect(store.persist({ state: makeState(), current, proposed })).resolves.toBeNull();
  });
});
