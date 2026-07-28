import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}));

import {
  PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
  publishPharmacyPublicNoindex,
  rollbackPharmacyPublicNoindex,
  type PharmacyPublicNoindexRpcPort,
  type PharmacyPublicNoindexRuntimePolicy,
} from "./import-pharmacy-public-noindex-lifecycle";

const actorId = "00000000-0000-4000-8000-000000000001";
const entityId = "00000000-0000-4000-8000-000000000002";
const candidateId = "00000000-0000-4000-8000-000000000003";

function policy(overrides: Partial<PharmacyPublicNoindexRuntimePolicy> = {}): PharmacyPublicNoindexRuntimePolicy {
  return {
    executionEnabled: true,
    environment: "preview",
    previewProjectRef: "preview-project",
    productionProjectRef: "production-project",
    supabaseUrl: "https://preview-project.supabase.co",
    allowedActorIds: [actorId],
    allowedEntityIds: [entityId],
    ...overrides,
  };
}

describe("Pharmacy public/noindex lifecycle", () => {
  it("uses one bilingual authority and publishes without index or sitemap promotion", async () => {
    const calls: Array<{ name: string; parameters: Record<string, unknown> }> = [];
    const port: PharmacyPublicNoindexRpcPort = {
      async rpc(name, parameters) {
        calls.push({ name, parameters });
        if (name === "import_authorize_pharmacy_public_noindex") {
          return {
            data: {
              status: "issued",
              authorizationId: "00000000-0000-4000-8000-000000000004",
              snapshotHash: "a".repeat(64),
            },
            error: null,
          };
        }
        return {
          data: {
            status: "published",
            terminalResult: {
              indexPolicy: "noindex",
              sitemapPolicy: "excluded",
            },
          },
          error: null,
        };
      },
    };

    const result = await publishPharmacyPublicNoindex(
      {
        actorId,
        entityId,
        candidateId,
        expectedEntityVersion: "2026-07-28 12:00:00+00",
        slug: "reviewed-pharmacy",
      },
      { port, policy: policy(), idempotencyKey: "pharmacy-noindex-attempt-1" },
    );

    expect(result).toEqual({
      ok: true,
      status: "published",
      visibility: "public",
      indexPolicy: "noindex",
      sitemapPolicy: "excluded",
      productionConnected: false,
    });
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({
      name: "import_authorize_pharmacy_public_noindex",
      parameters: {
        p_canonical_path_en: "/en/om/pharmacies/reviewed-pharmacy",
        p_canonical_path_ar: "/ar/om/pharmacies/reviewed-pharmacy",
        p_schema_version: PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION,
      },
    });
    expect(calls[1]?.name).toBe("import_publish_pharmacy_public_noindex");
    expect(JSON.stringify(result)).not.toContain("authorizationId");
  });

  it("fails closed before RPC access outside the exact Preview identity", async () => {
    const rpc = vi.fn();
    const result = await publishPharmacyPublicNoindex(
      {
        actorId,
        entityId,
        candidateId,
        expectedEntityVersion: "version-1",
        slug: "reviewed-pharmacy",
      },
      {
        port: { rpc },
        policy: policy({
          environment: "production",
          supabaseUrl: "https://production-project.supabase.co",
        }),
      },
    );

    expect(result).toEqual({ ok: false, reason: "environment_not_preview" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rolls back through the server-selected authority and returns bounded evidence", async () => {
    const port: PharmacyPublicNoindexRpcPort = {
      async rpc(name) {
        expect(name).toBe("import_rollback_pharmacy_public_noindex_by_authority");
        return {
          data: {
            status: "rolled_back",
            terminalResult: { exactLogicalRecovery: true },
          },
          error: null,
        };
      },
    };

    await expect(
      rollbackPharmacyPublicNoindex(
        { actorId, entityId },
        { port, policy: policy() },
      ),
    ).resolves.toEqual({
      ok: true,
      status: "rolled_back",
      visibility: "private",
      indexPolicy: "noindex",
      sitemapPolicy: "excluded",
      productionConnected: false,
    });
  });
});
