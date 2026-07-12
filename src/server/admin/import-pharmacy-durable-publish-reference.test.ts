import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPharmacyDurablePublishReferenceStore } from "./import-pharmacy-durable-publish-reference";

const HASH = "a".repeat(64);

function createClient(row: Record<string, unknown> | null = null) {
  const state: { inserted?: Record<string, unknown>; tokenHash?: string } = {};
  const client = {
    from() {
      return {
        insert(values: Record<string, unknown>) {
          state.inserted = values;
          return {
            select() {
              return { maybeSingle: async () => ({ data: { id: "reference-id" }, error: null }) };
            },
          };
        },
        select() {
          const query = {
            eq(_column: string, value: string) {
              state.tokenHash = value;
              return query;
            },
            maybeSingle: async () => ({ data: row, error: null }),
          };
          return query;
        },
      };
    },
  };
  return { client, state };
}

describe("durable Pharmacy publish reference", () => {
  it("stores only a token hash and resolves an actor/entity-bound rollback request", async () => {
    const now = new Date("2026-07-12T00:00:00.000Z");
    const { client, state } = createClient({
      actor_profile_id: "actor-1",
      entity_id: "entity-1",
      idempotency_record_id: "reservation-1",
      rollback_snapshot_id: "snapshot-1",
      expected_current_version: "version-2",
      expected_snapshot_hash: HASH,
      expires_at: "2026-07-13T00:00:00.000Z",
      consumed_at: null,
    });
    const store = createPharmacyDurablePublishReferenceStore(client as never, { now: () => now });
    const reference = await store.create({
      actorId: "actor-1",
      entityId: "entity-1",
      reservationId: "reservation-1",
      rollbackSnapshotId: "snapshot-1",
      actualVersion: "version-2",
      expectedSnapshotHash: HASH,
    });

    expect(reference).toBeTruthy();
    expect(state.inserted?.token_hash).not.toBe(reference);
    expect(state.inserted).not.toHaveProperty("token");

    const resolved = await store.resolve({ actorId: "actor-1", entityId: "entity-1", publishReference: reference! });
    expect(resolved).toEqual({
      reservationId: "reservation-1",
      rollbackSnapshotId: "snapshot-1",
      entityId: "entity-1",
      actorId: "actor-1",
      expectedCurrentVersion: "version-2",
      expectedSnapshotHash: HASH,
    });
    expect(state.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails closed for expired, consumed, or identity-mismatched references", async () => {
    const now = new Date("2026-07-12T00:00:00.000Z");
    for (const row of [
      { actor_profile_id: "other", entity_id: "entity-1", expires_at: "2026-07-13T00:00:00.000Z", consumed_at: null },
      { actor_profile_id: "actor-1", entity_id: "entity-1", expires_at: "2026-07-11T00:00:00.000Z", consumed_at: null },
      { actor_profile_id: "actor-1", entity_id: "entity-1", expires_at: "2026-07-13T00:00:00.000Z", consumed_at: "2026-07-12T00:00:00.000Z" },
    ]) {
      const { client } = createClient({
        idempotency_record_id: "reservation-1",
        rollback_snapshot_id: "snapshot-1",
        expected_current_version: "version-2",
        expected_snapshot_hash: HASH,
        ...row,
      });
      const store = createPharmacyDurablePublishReferenceStore(client as never, { now: () => now });
      await expect(store.resolve({ actorId: "actor-1", entityId: "entity-1", publishReference: "opaque" })).resolves.toBeNull();
    }
  });
});
