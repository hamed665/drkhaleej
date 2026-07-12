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

const IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED = false as const;

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
    executionEnabled: IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED,
    environment: process.env.VERCEL_ENV,
    allowedEntityIds,
    execute: async ({ operation, actorId, entityId }) => {
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
        status: "failed",
        entityId,
        blockers: [],
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
