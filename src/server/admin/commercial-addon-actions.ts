"use server";

import { revalidatePath } from "next/cache";

import { requireAdminPermission } from "@/server/admin/permissions";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import type {
  CommercialAddOnTerm,
  CommercialAddOnType,
} from "@/server/admin/commercial-addons";

type SponsoredCampaignInsert =
  Database["public"]["Tables"]["sponsored_campaigns"]["Insert"];
type SponsoredPlacementInsert =
  Database["public"]["Tables"]["sponsored_placements"]["Insert"];
type SponsoredSlotType = Database["public"]["Enums"]["sponsored_slot_type"];
type JsonValue = SponsoredCampaignInsert["metadata"];

export type CommercialAddOnAssignmentState = {
  ok: boolean;
  message: string | null;
};

const allowedAddOnTypes: CommercialAddOnType[] = [
  "homepage_ads",
  "special_offer_placement",
];
const allowedTerms: CommercialAddOnTerm[] = ["weekly", "monthly", "quarterly"];

function failure(message: string): CommercialAddOnAssignmentState {
  return { ok: false, message };
}

function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isAddOnType(value: string): value is CommercialAddOnType {
  return allowedAddOnTypes.some((addOnType) => addOnType === value);
}

function isTerm(value: string): value is CommercialAddOnTerm {
  return allowedTerms.some((term) => term === value);
}

function parseOptionalAmount(value: string | null): number | null | undefined {
  if (value === null) return null;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;

  return amount;
}

function parseStartDate(value: string | null): Date | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return date;
}

function addTerm(startDate: Date, term: CommercialAddOnTerm): Date {
  const endDate = new Date(startDate.getTime());

  if (term === "weekly") {
    endDate.setUTCDate(endDate.getUTCDate() + 7);
    return endDate;
  }

  if (term === "monthly") {
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    return endDate;
  }

  endDate.setUTCMonth(endDate.getUTCMonth() + 3);
  return endDate;
}

function addOnLabel(addOnType: CommercialAddOnType): string {
  return addOnType === "homepage_ads"
    ? "Homepage Ads"
    : "Special Offer Placement";
}

function termLabel(term: CommercialAddOnTerm): string {
  if (term === "weekly") return "Weekly";
  if (term === "monthly") return "Monthly";
  return "Quarterly";
}

function placementKey(addOnType: CommercialAddOnType): string {
  return addOnType === "homepage_ads"
    ? "homepage:addon:ads"
    : "special-offers:addon:placement";
}

function slotType(addOnType: CommercialAddOnType): SponsoredSlotType {
  return addOnType === "homepage_ads" ? "homepage_featured" : "featured_partner";
}

export async function createCommercialAddOnAssignment(
  _previousState: CommercialAddOnAssignmentState,
  formData: FormData,
): Promise<CommercialAddOnAssignmentState> {
  const adminContext = await requireAdminPermission("commercial_addons.assign");
  const admin = adminContext.profile;

  const centerId = formString(formData, "centerId");
  const addOnTypeValue = formString(formData, "addOnType");
  const termValue = formString(formData, "term");
  const budgetAmount = parseOptionalAmount(formString(formData, "budgetAmount"));
  const note = formString(formData, "note");
  const startsAtDate = parseStartDate(formString(formData, "startsAt")) ?? new Date();

  if (centerId === null || !isUuid(centerId)) {
    return failure("Select a valid center before saving this commercial add-on.");
  }

  if (addOnTypeValue === null || !isAddOnType(addOnTypeValue)) {
    return failure("Select either Homepage Ads or Special Offer Placement.");
  }

  if (termValue === null || !isTerm(termValue)) {
    return failure("Select a weekly, monthly, or quarterly term.");
  }

  if (budgetAmount === undefined) {
    return failure("Budget / price must be empty or a non-negative number.");
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id, name_en, slug")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) {
    return failure("Selected center could not be loaded. Refresh the page and try again.");
  }

  const startsAt = startsAtDate.toISOString();
  const endsAt = addTerm(startsAtDate, termValue).toISOString();
  const addOnName = addOnLabel(addOnTypeValue);
  const termName = termLabel(termValue);
  const key = placementKey(addOnTypeValue);

  const campaignPayload: SponsoredCampaignInsert = {
    budget_amount: budgetAmount,
    center_id: centerId,
    created_by_profile_id: admin.id,
    currency_code: "OMR",
    ends_at: endsAt,
    metadata: {
      commercial_add_on_type: addOnTypeValue,
      commercial_add_on_term: termValue,
      commercial_add_on_model_version: "ADDON-A",
      center_slug: center.slug,
      note,
      placement_key: key,
      public_activation: false,
      public_label_required: true,
      term_days:
        termValue === "weekly" ? 7 : termValue === "monthly" ? 30 : 90,
    } satisfies { [key: string]: JsonValue | undefined },
    starts_at: startsAt,
    status: "draft",
    title_en: `${addOnName} · ${termName} · ${center.name_en}`,
  };

  const { data: campaign, error: campaignError } = await supabase
    .from("sponsored_campaigns")
    .insert(campaignPayload)
    .select("id")
    .maybeSingle();

  if (campaignError !== null || campaign === null) {
    return failure("Commercial add-on campaign could not be saved. Refresh and try again before continuing.");
  }

  const placementPayload: SponsoredPlacementInsert = {
    campaign_id: campaign.id,
    country_code: "om",
    ends_at: endsAt,
    is_active: false,
    metadata: {
      commercial_add_on_type: addOnTypeValue,
      commercial_add_on_term: termValue,
      commercial_add_on_model_version: "ADDON-A",
      public_activation: false,
    } satisfies { [key: string]: JsonValue | undefined },
    placement_key: key,
    slot_type: slotType(addOnTypeValue),
    starts_at: startsAt,
    target_center_id: centerId,
  };

  const { error: placementError } = await supabase
    .from("sponsored_placements")
    .insert(placementPayload);

  if (placementError !== null) {
    return failure("Commercial add-on campaign was created, but its placement shell could not be saved. Review before continuing.");
  }

  revalidatePath("/admin/commercial-addons");

  await writeAdminAuditEvent({ admin: adminContext, permissionKey: "commercial_addons.assign", action: "commercial_addon.assigned", entityType: "commercial_addon", entityId: campaign.id, targetTable: "sponsored_campaigns", summary: "Commercial add-on assignment created as draft.", newValues: { center_id: centerId, add_on_type: addOnTypeValue, term: termValue } });

  return {
    ok: true,
    message: `${addOnName} ${termName} assignment was saved as draft. It is not public or billed yet.`,
  };
}
