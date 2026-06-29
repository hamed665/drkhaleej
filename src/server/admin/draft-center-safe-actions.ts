"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";
import {
  updateDraftCenterDetails,
  type DraftCenterUpdateState,
} from "@/server/admin/draft-center-actions";

export type { DraftCenterUpdateState } from "@/server/admin/draft-center-actions";

type VerificationStatus = Database["public"]["Enums"]["verification_status"];

function failure(message: string): DraftCenterUpdateState {
  return { ok: false, message };
}

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function cloneFormDataWithoutReviewState(formData: FormData): FormData {
  const safeFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    if (key === "verificationStatus") continue;
    safeFormData.append(key, value);
  }

  return safeFormData;
}

async function getCurrentVerificationStatus(centerId: string): Promise<VerificationStatus | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select("verification_status")
    .eq("id", centerId)
    .in("status", ["draft", "pending_review"])
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null || data === null) return null;
  return data.verification_status;
}

export async function updateDraftCenterDetailsPreservingVerification(
  previousState: DraftCenterUpdateState,
  formData: FormData,
): Promise<DraftCenterUpdateState> {
  await requireAdminPermission("draft_centers.update");

  const centerId = readFormString(formData, "centerId");
  if (centerId === null || !isUuid(centerId)) {
    return failure("Draft center could not be identified.");
  }

  const currentVerificationStatus = await getCurrentVerificationStatus(centerId);
  if (currentVerificationStatus === null) {
    return failure("Draft center verification state could not be preserved.");
  }

  const safeFormData = cloneFormDataWithoutReviewState(formData);
  safeFormData.append("verificationStatus", currentVerificationStatus);

  return updateDraftCenterDetails(previousState, safeFormData);
}
