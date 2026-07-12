"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import {
  createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment,
  loadPharmacyPrivateAdminRuntimeContext,
} from "@/server/admin/import-pharmacy-private-admin-runtime-context";
import {
  createPharmacyPrivateAdminServerAction,
  type PharmacyPrivateAdminServerActionResult,
} from "@/server/admin/import-pharmacy-private-admin-server-action";

const IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review"] as const;

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export async function runPharmacyPrivateAdminAction(
  formData: FormData,
): Promise<PharmacyPrivateAdminServerActionResult> {
  const admin = await requirePlatformAdmin();
  const allowedActorIds = parseAllowlist(process.env.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const allowedEntityIds = parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const action = createPharmacyPrivateAdminServerAction({
    executionEnabled: process.env.VERCEL_ENV === "preview",
    enabledOperations: IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS,
    environment: process.env.VERCEL_ENV,
    allowedEntityIds,
    execute: async ({ operation, actorId, entityId }) => {
      if (operation !== "dry_run" && operation !== "review") {
        return {
          operation,
          status: "failed",
          entityId,
          blockers: [],
          publicVisibility: "private",
          indexEligible: false,
          sitemapEligible: false,
          routeEnabled: false,
          executionReference: null,
        };
      }

      const reader = createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment();
      const context = reader
        ? await loadPharmacyPrivateAdminRuntimeContext(
            {
              executionEnabled: true,
              environment: process.env.VERCEL_ENV,
              actorId,
              entityId,
              allowedActorIds,
              allowedEntityIds,
              approvalToken: process.env.IMPORT_PREVIEW_APPROVAL_TOKEN ?? "",
              expectedApprovalToken: process.env.IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN ?? "",
            },
            reader,
          )
        : null;

      return {
        operation,
        status: context?.ok ? "completed" : "failed",
        entityId,
        blockers: context?.ok ? [] : ["readiness_blocked"],
        publicVisibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        executionReference: context?.ok ? context.snapshotHash : null,
      };
    },
  });

  return action({ actorId: admin.id, formData });
}

export async function runPharmacyPrivateAdminActionState(
  _previousState: PharmacyPrivateAdminServerActionResult | null,
  formData: FormData,
): Promise<PharmacyPrivateAdminServerActionResult> {
  return runPharmacyPrivateAdminAction(formData);
}
