"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database, Json } from "@/lib/supabase/types";

type CenterInsert = Database["public"]["Tables"]["centers"]["Insert"];
type ProviderOnboardingLeadUpdate =
  Database["public"]["Tables"]["provider_onboarding_leads"]["Update"];
type ProviderOnboardingLeadEventInsert =
  Database["public"]["Tables"]["provider_onboarding_lead_events"]["Insert"];
type CenterType = Database["public"]["Enums"]["center_type"];

export type DraftCenterCreationState = {
  ok: boolean;
  message: string | null;
};

const genericFailureState: DraftCenterCreationState = {
  ok: false,
  message: "Draft center could not be created from this lead.",
};

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug.length > 0 ? slug : "center";
}

function providerTypeToCenterType(providerType: string): CenterType {
  const normalized = providerType.toLowerCase().replace(/[_-]+/g, " ");

  if (normalized.includes("hospital")) return "hospital";
  if (normalized.includes("dental") || normalized.includes("dentist")) {
    return "dental_clinic";
  }
  if (normalized.includes("beauty") || normalized.includes("aesthetic")) {
    return "beauty_clinic";
  }
  if (normalized.includes("lab") || normalized.includes("laboratory")) {
    return "laboratory";
  }
  if (normalized.includes("image") || normalized.includes("radiology")) {
    return "imaging_center";
  }
  if (normalized.includes("pharmacy")) return "pharmacy";
  if (normalized.includes("physio")) return "physiotherapy_center";
  if (normalized.includes("wellness") || normalized.includes("spa")) {
    return "wellness_center";
  }
  if (normalized.includes("medical") || normalized.includes("clinic")) {
    return "clinic";
  }

  return "other";
}

function safeLeadMetadata(metadata: Json): Record<string, Json> {
  if (typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)) {
    return metadata;
  }

  return {};
}

function buildDraftCenterInsert({
  lead,
  slug,
}: {
  lead: {
    area_text: string | null;
    center_name: string;
    city_text: string | null;
    country_code: Database["public"]["Enums"]["country_code"];
    email: string | null;
    id: string;
    locale: Database["public"]["Enums"]["app_locale"];
    message: string | null;
    phone: string;
    provider_type: string;
    request_source: string;
    whatsapp: string | null;
  };
  slug: string;
}): CenterInsert {
  return {
    center_type: providerTypeToCenterType(lead.provider_type),
    default_country: lead.country_code,
    default_locale: lead.locale,
    description_en: null,
    email: lead.email,
    is_active: false,
    is_claimable: false,
    is_featured: false,
    metadata: {
      created_from: "provider_onboarding_lead",
      source_provider_onboarding_lead_id: lead.id,
      source_provider_type: lead.provider_type,
      source_request: lead.request_source,
    },
    name_en: lead.center_name,
    primary_phone: lead.phone,
    public_email_visible: false,
    public_primary_phone_visible: false,
    public_secondary_phone_visible: false,
    public_whatsapp_phone_visible: false,
    short_description_en:
      lead.message === null || lead.message.trim().length === 0
        ? null
        : lead.message.trim().slice(0, 240),
    slug,
    status: "draft",
    verification_status: "unverified",
    whatsapp_phone: lead.whatsapp,
  };
}

export async function createDraftCenterFromLead(
  _previousState: DraftCenterCreationState,
  formData: FormData,
): Promise<DraftCenterCreationState> {
  const platformAdmin = await requirePlatformAdmin();
  const leadId = readFormString(formData, "leadId");

  if (leadId === null || !isUuid(leadId)) {
    return genericFailureState;
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: lead, error: leadError } = await supabase
    .from("provider_onboarding_leads")
    .select(
      "id, center_name, contact_name, phone, email, whatsapp, provider_type, area_text, city_text, country_code, locale, message, metadata, status, priority, request_source, handled_at",
    )
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle();

  if (leadError !== null || lead === null) {
    return genericFailureState;
  }

  const leadMetadata = safeLeadMetadata(lead.metadata);
  const existingCenterId = leadMetadata.draft_center_id;

  if (typeof existingCenterId === "string" && isUuid(existingCenterId)) {
    return {
      ok: true,
      message:
        "This lead already has a draft center linked. Open Center subscriptions after refreshing.",
    };
  }

  const slug = `draft-${slugify(lead.center_name)}-${lead.id.slice(0, 8)}`;

  const { data: existingCenterBySlug, error: existingCenterError } = await supabase
    .from("centers")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingCenterError !== null) {
    return genericFailureState;
  }

  const now = new Date().toISOString();
  const centerId = existingCenterBySlug?.id ?? null;

  const finalCenterId = centerId ?? (await insertDraftCenter({ lead, slug }));

  if (finalCenterId === null) {
    return genericFailureState;
  }

  const updatedLeadMetadata: Record<string, Json> = {
    ...leadMetadata,
    draft_center_created_at: now,
    draft_center_created_by_profile_id: platformAdmin.id,
    draft_center_id: finalCenterId,
    draft_center_slug: slug,
  };

  const leadUpdate: ProviderOnboardingLeadUpdate = {
    handled_at: lead.handled_at ?? now,
    metadata: updatedLeadMetadata,
    status: "converted",
    updated_at: now,
  };

  const { error: leadUpdateError } = await supabase
    .from("provider_onboarding_leads")
    .update(leadUpdate)
    .eq("id", leadId)
    .is("deleted_at", null);

  if (leadUpdateError !== null) {
    return {
      ok: false,
      message:
        "Draft center was created, but the lead could not be linked. Refresh before continuing.",
    };
  }

  const eventRows: ProviderOnboardingLeadEventInsert[] = [
    {
      actor_profile_id: platformAdmin.id,
      event_type: "draft_center_created",
      lead_id: leadId,
      metadata: {
        center_id: finalCenterId,
        center_slug: slug,
        source: "admin_create_draft_center_from_lead",
      },
      note_text: "Draft center created from provider onboarding lead.",
    },
  ];

  if (lead.status !== "converted") {
    eventRows.push({
      actor_profile_id: platformAdmin.id,
      event_type: "status_changed",
      lead_id: leadId,
      metadata: {
        source: "admin_create_draft_center_from_lead",
      },
      new_status: "converted",
      old_status: lead.status,
    });
  }

  const { error: eventError } = await supabase
    .from("provider_onboarding_lead_events")
    .insert(eventRows);

  revalidatePath("/admin/provider-onboarding-leads");
  revalidatePath(`/admin/provider-onboarding-leads/${leadId}`);
  revalidatePath("/admin/center-subscriptions");

  if (eventError !== null) {
    return {
      ok: false,
      message:
        "Draft center was created, but the lead history event could not be recorded. Refresh before continuing.",
    };
  }

  return {
    ok: true,
    message:
      "Draft center was created. Refresh Center subscriptions to assign a plan.",
  };
}

async function insertDraftCenter({
  lead,
  slug,
}: {
  lead: Parameters<typeof buildDraftCenterInsert>[0]["lead"];
  slug: string;
}): Promise<string | null> {
  const supabase = createSupabaseServiceRoleClient();

  const { data: insertedCenter, error: insertError } = await supabase
    .from("centers")
    .insert(buildDraftCenterInsert({ lead, slug }))
    .select("id")
    .maybeSingle();

  if (insertError !== null || insertedCenter === null) {
    return null;
  }

  return insertedCenter.id;
}
