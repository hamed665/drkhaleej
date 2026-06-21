"use server";

import { revalidatePath } from "next/cache";

import { requireAdminPermission } from "@/server/admin/permissions";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

const allowedStatuses = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "rejected",
  "converted",
  "closed",
] as const;

const allowedPriorities = ["low", "normal", "high"] as const;
const handledStatuses = [
  "contacted",
  "qualified",
  "rejected",
  "converted",
  "closed",
] as const;

export type ProviderOnboardingLeadMutationState = {
  ok: boolean;
  message: string | null;
};

type ProviderOnboardingLeadStatus = (typeof allowedStatuses)[number];
type ProviderOnboardingLeadPriority = (typeof allowedPriorities)[number];
type ProviderOnboardingLeadUpdate =
  Database["public"]["Tables"]["provider_onboarding_leads"]["Update"];
type ProviderOnboardingLeadEventInsert =
  Database["public"]["Tables"]["provider_onboarding_lead_events"]["Insert"];

const genericFailureState: ProviderOnboardingLeadMutationState = {
  ok: false,
  message: "Lead could not be updated.",
};

function readRequiredFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isAllowedStatus(value: string): value is ProviderOnboardingLeadStatus {
  return allowedStatuses.some((status) => status === value);
}

function isAllowedPriority(value: string): value is ProviderOnboardingLeadPriority {
  return allowedPriorities.some((priority) => priority === value);
}

function shouldSetHandledAt(
  handledAt: string | null,
  status: ProviderOnboardingLeadStatus,
): boolean {
  return (
    handledAt === null &&
    handledStatuses.some((handledStatus) => handledStatus === status)
  );
}

function buildLeadEventRows({
  actorProfileId,
  leadId,
  oldStatus,
  newStatus,
  oldPriority,
  newPriority,
}: {
  actorProfileId: string;
  leadId: string;
  oldStatus: string;
  newStatus: ProviderOnboardingLeadStatus;
  oldPriority: string;
  newPriority: ProviderOnboardingLeadPriority;
}): ProviderOnboardingLeadEventInsert[] {
  const metadata = { source: "admin_status_priority_form" };
  const events: ProviderOnboardingLeadEventInsert[] = [];

  if (oldStatus !== newStatus) {
    events.push({
      actor_profile_id: actorProfileId,
      event_type: "status_changed",
      lead_id: leadId,
      metadata,
      new_priority: null,
      new_status: newStatus,
      note_text: null,
      old_priority: null,
      old_status: oldStatus,
    });
  }

  if (oldPriority !== newPriority) {
    events.push({
      actor_profile_id: actorProfileId,
      event_type: "priority_changed",
      lead_id: leadId,
      metadata,
      new_priority: newPriority,
      new_status: null,
      note_text: null,
      old_priority: oldPriority,
      old_status: null,
    });
  }

  return events;
}

export async function updateProviderOnboardingLeadStatusPriority(
  _previousState: ProviderOnboardingLeadMutationState,
  formData: FormData,
): Promise<ProviderOnboardingLeadMutationState> {
  const admin = await requireAdminPermission("provider_leads.update_status");
  const platformAdmin = admin.profile;

  const leadId = readRequiredFormString(formData, "leadId");
  const status = readRequiredFormString(formData, "status");
  const priority = readRequiredFormString(formData, "priority");

  if (leadId === null || status === null || priority === null) {
    return genericFailureState;
  }

  if (!isAllowedStatus(status) || !isAllowedPriority(priority)) {
    return genericFailureState;
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: existingLead, error: readError } = await supabase
    .from("provider_onboarding_leads")
    .select("id, status, priority, handled_at")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError !== null || existingLead === null) {
    return genericFailureState;
  }

  const oldStatus = existingLead.status;
  const oldPriority = existingLead.priority;
  const historyEvents = buildLeadEventRows({
    actorProfileId: platformAdmin.id,
    leadId,
    oldStatus,
    newStatus: status,
    oldPriority,
    newPriority: priority,
  });

  if (historyEvents.length === 0) {
    return {
      ok: true,
      message: "No status or priority changes were made.",
    };
  }

  const updatedAt = new Date().toISOString();
  const updatePayload: ProviderOnboardingLeadUpdate = {
    status,
    priority,
    updated_at: updatedAt,
  };

  if (shouldSetHandledAt(existingLead.handled_at, status)) {
    updatePayload.handled_at = updatedAt;
  }

  const { data: updatedLead, error: updateError } = await supabase
    .from("provider_onboarding_leads")
    .update(updatePayload)
    .eq("id", leadId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedLead === null) {
    return genericFailureState;
  }

  const { error: eventError } = await supabase
    .from("provider_onboarding_lead_events")
    .insert(historyEvents);

  revalidatePath("/admin/provider-onboarding-leads");
  revalidatePath(`/admin/provider-onboarding-leads/${leadId}`);

  if (eventError !== null) {
    return {
      ok: false,
      message:
        "Lead was updated, but the history event could not be recorded. Refresh and review the lead before continuing.",
    };
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "provider_leads.update_status",
    action: "provider_lead.status_priority_updated",
    entityType: "provider_onboarding_lead",
    entityId: leadId,
    targetTable: "provider_onboarding_leads",
    summary: "Provider onboarding lead status/priority updated.",
    oldValues: { status: oldStatus, priority: oldPriority },
    newValues: { status, priority },
  });

  return {
    ok: true,
    message: "Lead status and priority were updated.",
  };
}
