import "server-only";

import {
  createImportSupabasePublishPersistenceAdapter,
  type ImportSupabaseRpcClient,
} from "./import-supabase-publish-persistence-adapter";
import type { ImportPrivatePublishPersistenceAdapter } from "./import-private-persistence-adapter";

export const IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED = false as const;

export type ImportPreviewReservationAdapterWiringBlocker =
  | "environment_not_preview"
  | "service_role_not_configured"
  | "reservation_mode_not_enabled"
  | "preview_wiring_disabled";

export type ImportPreviewReservationAdapterWiringInput = {
  environment: "development" | "preview" | "production";
  serviceRoleConfigured: boolean;
  reservationModeEnabled: boolean;
  createRpcClient: () => ImportSupabaseRpcClient;
};

export type ImportPreviewReservationAdapterWiringResult = {
  mode: "preview_wiring_disabled";
  wiringReady: boolean;
  clientConstructed: boolean;
  adapter: ImportPrivatePublishPersistenceAdapter | null;
  executionReady: false;
  mutationEnabled: false;
  terminalPersistenceAllowed: false;
  entityMutationAllowed: false;
  bulkAllowed: false;
  blockers: readonly ImportPreviewReservationAdapterWiringBlocker[];
  allowedEnvironment: "preview";
  allowedRpcNames: readonly ["import_publish_reserve_snapshot_audit"];
};

export function createImportPreviewReservationAdapterWiring(
  input: ImportPreviewReservationAdapterWiringInput,
): ImportPreviewReservationAdapterWiringResult {
  const blockers: ImportPreviewReservationAdapterWiringBlocker[] = [];

  if (input.environment !== "preview") blockers.push("environment_not_preview");
  if (!input.serviceRoleConfigured) blockers.push("service_role_not_configured");
  if (!input.reservationModeEnabled) blockers.push("reservation_mode_not_enabled");
  if (!IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED) blockers.push("preview_wiring_disabled");

  const uniqueBlockers = [...new Set(blockers)];
  const wiringReady = uniqueBlockers.every((blocker) => blocker === "preview_wiring_disabled");

  if (!wiringReady || !IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED) {
    return {
      mode: "preview_wiring_disabled",
      wiringReady,
      clientConstructed: false,
      adapter: null,
      executionReady: false,
      mutationEnabled: false,
      terminalPersistenceAllowed: false,
      entityMutationAllowed: false,
      bulkAllowed: false,
      blockers: uniqueBlockers,
      allowedEnvironment: "preview",
      allowedRpcNames: ["import_publish_reserve_snapshot_audit"],
    };
  }

  const adapter = createImportSupabasePublishPersistenceAdapter(input.createRpcClient());

  return {
    mode: "preview_wiring_disabled",
    wiringReady,
    clientConstructed: true,
    adapter,
    executionReady: false,
    mutationEnabled: false,
    terminalPersistenceAllowed: false,
    entityMutationAllowed: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
    allowedEnvironment: "preview",
    allowedRpcNames: ["import_publish_reserve_snapshot_audit"],
  };
}
