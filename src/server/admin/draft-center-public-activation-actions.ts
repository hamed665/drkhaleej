"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";
import { getDraftCenterPublicationReadiness } from "@/server/admin/draft-center-publication-readiness";

type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];

type PublishableCenterRow = {
  id: string;
  is_active: boolean;
  is_claimable: boolean;
  slug: string;
  status: string;
};

export type DraftCenterPublicActivationState = {
  ok: boolean;
  message: string | null;
};

const failure: DraftCenterPublicActivationState = {
  ok: false,
  message: "Center could not be activated publicly.",
};

function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function publicCenterPath(locale: "en" | "ar", slug: string): string {
  return `/${locale}/om/center/${slug}`;
}

export async function activateDraftCenterPublicProfile(
  _previousState: DraftCenterPublicActivationState,
  formData: FormData,
): Promise<DraftCenterPublicActivationState> {
  const admin = await requireAdminPermission("draft_centers.update");
  const centerId = formString(formData, "centerId");

  if (centerId === null || !isUuid(centerId)) return failure;

  const readinessResult = await getDraftCenterPublicationReadiness(centerId);
  if (!readinessResult.ok) return failure;

  const { readiness } = readinessResult;
  if (!readiness.canPublish) {
    return {
      ok: false,
      message: `Center is not ready: ${readiness.blockers.join(" ")}`,
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id,slug,status,is_active,is_claimable")
    .eq("id", centerId)
    .eq("status", "pending_review")
    .eq("is_active", false)
    .eq("is_claimable", false)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) return failure;

  const current = center as PublishableCenterRow;
  const updatePayload: CenterUpdate = {
    is_active: true,
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("centers")
    .update(updatePayload)
    .eq("id", centerId)
    .eq("status", "pending_review")
    .eq("is_active", false)
    .eq("is_claimable", false)
    .is("deleted_at", null);

  if (updateError !== null) return failure;

  const enPath = publicCenterPath("en", current.slug);
  const arPath = publicCenterPath("ar", current.slug);

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.update",
    action: "draft_center.public_profile_activated",
    entityType: "center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Draft center public profile activated.",
    oldValues: {
      is_active: current.is_active,
      is_claimable: current.is_claimable,
      status: current.status,
    },
    newValues: {
      is_active: true,
      is_claimable: false,
      status: "active",
    },
    metadata: {
      evidence_summary: readiness.evidenceSummary,
      public_paths: [enPath, arPath],
      sitemap_revalidated: true,
    },
  });

  revalidatePath(`/admin/draft-centers/${centerId}`);
  revalidatePath(enPath);
  revalidatePath(arPath);
  revalidatePath("/sitemap.xml");

  return {
    ok: true,
    message: "Center public profile was activated.",
  };
}
