import "server-only";

import { IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION } from "./import-reservation-audit-contract";

import {
  createImportSupabasePublishPersistenceAdapter,
  type ImportSupabaseRpcClient,
  type ImportSupabaseRpcResponse,
} from "./import-supabase-publish-persistence-adapter";
import type {
  ImportPublishPersistenceTransactionRequest,
  ImportPublishPersistenceTransactionResult,
} from "./import-private-persistence-adapter";

const EXPECTED_RESERVATION_RPC = "import_publish_reserve_snapshot_audit";

export type ImportReservationCanaryScenario =
  | "reserved"
  | "replayed"
  | "conflict"
  | "failed";

export type ImportReservationCanaryHarnessResult = {
  scenario: ImportReservationCanaryScenario;
  rpcCalls: readonly string[];
  result: ImportPublishPersistenceTransactionResult;
  databaseConnected: false;
  entityMutationAttempted: false;
  terminalPersistenceAttempted: false;
};

const BASE_REQUEST: ImportPublishPersistenceTransactionRequest = {
  entityId: "00000000-0000-4000-8000-000000000001",
  actorId: "00000000-0000-4000-8000-000000000002",
  idempotencyKey: "canary-reservation-harness-001",
  requestHash: "a".repeat(64),
  expectedVersion: "version-001",
  rollbackSnapshot: {
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    publishStatus: "approved",
    publicReady: false,
    projectionVersion: "projection-001",
    canonicalRoute: "/en/doctors/canary-provider",
  },
  auditSchemaVersion: IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION,
  reservationExpiresAt: "2099-01-02T00:00:00.000Z",
  rollbackExpiresAt: "2099-03-01T00:00:00.000Z",
};

function responseForScenario(scenario: ImportReservationCanaryScenario): ImportSupabaseRpcResponse {
  switch (scenario) {
    case "reserved":
      return {
        data: {
          status: "reserved",
          idempotencyRecordId: "00000000-0000-4000-8000-000000000010",
          rollbackSnapshotId: "00000000-0000-4000-8000-000000000011",
          auditEventId: "00000000-0000-4000-8000-000000000012",
        },
        error: null,
      };
    case "replayed":
      return {
        data: {
          status: "replayed",
          terminalResult: {
            status: "succeeded",
            entityId: BASE_REQUEST.entityId,
            idempotencyKey: BASE_REQUEST.idempotencyKey,
            requestHash: BASE_REQUEST.requestHash,
            auditEventId: "00000000-0000-4000-8000-000000000013",
            rollbackSnapshotId: "00000000-0000-4000-8000-000000000014",
            committedAt: "2099-01-01T00:00:00.000Z",
          },
        },
        error: null,
      };
    case "conflict":
      return {
        data: {
          status: "conflict",
          reason: "idempotency_request_mismatch",
        },
        error: null,
      };
    case "failed":
      return {
        data: null,
        error: { code: "HARNESS_RPC_FAILURE", message: "Synthetic harness failure" },
      };
  }
}

export async function runImportReservationCanaryHarness(
  scenario: ImportReservationCanaryScenario,
): Promise<ImportReservationCanaryHarnessResult> {
  const rpcCalls: string[] = [];
  const client: ImportSupabaseRpcClient = {
    async rpc(name: string): Promise<ImportSupabaseRpcResponse> {
      rpcCalls.push(name);
      if (name !== EXPECTED_RESERVATION_RPC) {
        return {
          data: null,
          error: { code: "UNEXPECTED_RPC", message: `Unexpected RPC: ${name}` },
        };
      }
      return responseForScenario(scenario);
    },
  };

  const adapter = createImportSupabasePublishPersistenceAdapter(client);
  const result = await adapter.runReservationSnapshotAuditTransaction(BASE_REQUEST);

  return {
    scenario,
    rpcCalls,
    result,
    databaseConnected: false,
    entityMutationAttempted: false,
    terminalPersistenceAttempted: false,
  };
}

export async function runAllImportReservationCanaryHarnessScenarios(): Promise<
  readonly ImportReservationCanaryHarnessResult[]
> {
  const scenarios: readonly ImportReservationCanaryScenario[] = [
    "reserved",
    "replayed",
    "conflict",
    "failed",
  ];

  return Promise.all(scenarios.map(runImportReservationCanaryHarness));
}
