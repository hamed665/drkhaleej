"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
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
  const action = createPharmacyPrivateAdminServerAction({
    executionEnabled: IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED,
    environment: process.env.VERCEL_ENV,
    allowedEntityIds: parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS),
    execute: async () => {
      throw new Error("Pharmacy private Admin action runtime is disabled.");
    },
  });

  return action({ actorId: admin.id, formData });
}
