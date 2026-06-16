"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

const allowedStatuses = [
  "pending",
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;
const allowedPlanTiers = [
  "free_listing",
  "verified_starter",
  "growth_partner",
  "premium_partner",
] as const;
const allowedBillingTerms = ["quarterly", "semi_annual", "annual"] as const;
const maxNotesLength = 2000;

type PlanTier = (typeof allowedPlanTiers)[number];
type BillingTerm = (typeof allowedBillingTerms)[number];
type CenterSubscriptionStatus = (typeof allowedStatuses)[number];
type CenterSubscriptionInsert =
  Database["public"]["Tables"]["center_subscriptions"]["Insert"];
type CenterSubscriptionUpdate =
  Database["public"]["Tables"]["center_subscriptions"]["Update"];
type SubscriptionPlanInsert =
  Database["public"]["Tables"]["subscription_plans"]["Insert"];

export type CenterSubscriptionAssignmentState = {
  ok: boolean;
  message: string | null;
};

const genericFailureState: CenterSubscriptionAssignmentState = {
  ok: false,
  message: "Center subscription assignment could not be saved.",
};

const addOnPolicy =
  "Homepage ads and Special Offer placements are separate paid products available across plans.";

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

function isAllowedStatus(value: string): value is CenterSubscriptionStatus {
  return allowedStatuses.some((status) => status === value);
}

function isPlanTier(value: string): value is PlanTier {
  return allowedPlanTiers.some((tier) => tier === value);
}

function isBillingTerm(value: string): value is BillingTerm {
  return allowedBillingTerms.some((term) => term === value);
}

function parseOptionalAmount(value: string | null): number | null | undefined {
  if (value === null) {
    return null;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return amount;
}

function parseOptionalDate(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return undefined;
  }

  return date.toISOString();
}

function parseOptionalNotes(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return null;
  }

  if (trimmedValue.length > maxNotesLength) {
    return undefined;
  }

  return trimmedValue;
}

function planSlug(planTier: PlanTier, billingTerm: BillingTerm): string | null {
  if (planTier === "free_listing") {
    return billingTerm === "annual" ? "free-listing" : null;
  }

  const baseSlugByTier: Record<Exclude<PlanTier, "free_listing">, string> = {
    verified_starter: "verified-starter",
    growth_partner: "growth-partner",
    premium_partner: "premium-partner",
  };

  const baseSlug = baseSlugByTier[planTier];
  if (billingTerm === "annual") return baseSlug;
  if (billingTerm === "semi_annual") return `${baseSlug}-semi-annual`;

  return `${baseSlug}-${billingTerm}`;
}

function planPayload(planTier: PlanTier, billingTerm: BillingTerm): SubscriptionPlanInsert | null {
  const slug = planSlug(planTier, billingTerm);
  if (slug === null) return null;

  const tierConfig = {
    free_listing: {
      nameEn: "Free Listing",
      nameAr: "القائمة المجانية",
      descriptionEn:
        "Basic approved directory presence for providers that should be discoverable without paid subscription features.",
      descriptionAr:
        "ظهور أساسي معتمد في الدليل للمراكز التي يجب أن تكون قابلة للاكتشاف بدون مزايا اشتراك مدفوع.",
      includesClaimBadge: false,
      includesMediaGallery: false,
      maxDoctors: 0,
      maxLocations: 1,
      maxServices: 3,
      planKey: "free_listing",
      sortGroup: 10,
      status: "active" as const,
    },
    verified_starter: {
      nameEn: "Verified Starter",
      nameAr: "البداية الموثقة",
      descriptionEn:
        "Trust-focused starter plan for verified providers with richer profile presentation and controlled media support.",
      descriptionAr:
        "خطة بداية تركز على الثقة للمراكز الموثقة مع عرض ملف أفضل ودعم وسائط مضبوط.",
      includesClaimBadge: true,
      includesMediaGallery: true,
      maxDoctors: 5,
      maxLocations: 1,
      maxServices: 10,
      planKey: "verified_starter",
      sortGroup: 20,
      status: "draft" as const,
    },
    growth_partner: {
      nameEn: "Growth Partner",
      nameAr: "شريك النمو",
      descriptionEn:
        "Growth plan for providers that need stronger profile depth, offer capacity, analytics, and lead support.",
      descriptionAr:
        "خطة نمو للمراكز التي تحتاج إلى ملف أعمق وسعة عروض وتحليلات ودعم للطلبات.",
      includesClaimBadge: true,
      includesMediaGallery: true,
      maxDoctors: 15,
      maxLocations: 3,
      maxServices: 30,
      planKey: "growth_partner",
      sortGroup: 30,
      status: "draft" as const,
    },
    premium_partner: {
      nameEn: "Premium Partner",
      nameAr: "الشريك المميز",
      descriptionEn:
        "Premium commercial plan for providers that need advanced profile support, richer capacity, analytics, and account operations. Paid ads and Special Offer placements remain separate add-ons available across plans.",
      descriptionAr:
        "خطة تجارية مميزة للمراكز التي تحتاج إلى دعم ملف متقدم وسعة أكبر وتحليلات وتشغيل حساب. الإعلانات المدفوعة ومواضع العروض الخاصة تبقى إضافات منفصلة متاحة عبر الخطط.",
      includesClaimBadge: true,
      includesMediaGallery: true,
      maxDoctors: 50,
      maxLocations: 10,
      maxServices: 100,
      planKey: "premium_partner",
      sortGroup: 40,
      status: "draft" as const,
    },
  }[planTier];

  const intervalLabel = {
    quarterly: "Quarterly",
    semi_annual: "Semi Annual",
    annual: "Annual",
  }[billingTerm];
  const intervalSort = {
    quarterly: 2,
    semi_annual: 3,
    annual: 4,
  }[billingTerm];

  return {
    slug,
    name_en:
      billingTerm === "annual"
        ? tierConfig.nameEn
        : `${tierConfig.nameEn} · ${intervalLabel}`,
    name_ar:
      billingTerm === "annual"
        ? tierConfig.nameAr
        : `${tierConfig.nameAr} · ${intervalLabel}`,
    description_en: tierConfig.descriptionEn,
    description_ar: tierConfig.descriptionAr,
    price_amount: 0,
    currency_code: "OMR",
    interval: billingTerm,
    status: tierConfig.status,
    includes_claim_badge: tierConfig.includesClaimBadge,
    includes_featured_listing: false,
    includes_media_gallery: tierConfig.includesMediaGallery,
    max_doctors: tierConfig.maxDoctors,
    max_locations: tierConfig.maxLocations,
    max_services: tierConfig.maxServices,
    sort_order: tierConfig.sortGroup * 100 + intervalSort,
    metadata: {
      add_on_policy: addOnPolicy,
      billing_term: billingTerm,
      commercial_model_version: "PLAN-A2",
      paid_add_ons_available: true,
      plan_key: `${tierConfig.planKey}_${billingTerm}`,
      plan_tier: planTier,
      pricing_status:
        planTier === "free_listing" ? "final" : "pending_final_pricing",
      storefront_visibility: "admin_assignment_available",
    },
  };
}

export async function upsertCenterSubscriptionAssignment(
  _previousState: CenterSubscriptionAssignmentState,
  formData: FormData,
): Promise<CenterSubscriptionAssignmentState> {
  const platformAdmin = await requirePlatformAdmin();

  const centerId = readFormString(formData, "centerId");
  const planTier = readFormString(formData, "planTier");
  const billingTerm = readFormString(formData, "billingTerm");
  const status = readFormString(formData, "status");
  const agreedPriceAmount = parseOptionalAmount(
    readFormString(formData, "agreedPriceAmount"),
  );
  const startsAt = parseOptionalDate(readFormString(formData, "startsAt"));
  const endsAt = parseOptionalDate(readFormString(formData, "endsAt"));
  const trialEndsAt = parseOptionalDate(readFormString(formData, "trialEndsAt"));
  const notes = parseOptionalNotes(readFormString(formData, "notes"));

  if (
    centerId === null ||
    planTier === null ||
    billingTerm === null ||
    status === null ||
    !isUuid(centerId) ||
    !isPlanTier(planTier) ||
    !isBillingTerm(billingTerm) ||
    !isAllowedStatus(status) ||
    agreedPriceAmount === undefined ||
    startsAt === undefined ||
    endsAt === undefined ||
    trialEndsAt === undefined ||
    notes === undefined
  ) {
    return genericFailureState;
  }

  const selectedPlanPayload = planPayload(planTier, billingTerm);
  if (selectedPlanPayload === null) {
    return genericFailureState;
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) {
    return genericFailureState;
  }

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .upsert(selectedPlanPayload, { onConflict: "slug" })
    .select("id, currency_code, interval")
    .maybeSingle();

  if (planError !== null || plan === null) {
    return genericFailureState;
  }

  const { data: existingSubscriptions, error: existingError } = await supabase
    .from("center_subscriptions")
    .select("id")
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (existingError !== null || existingSubscriptions === null) {
    return genericFailureState;
  }

  const updatedAt = new Date().toISOString();
  const existingSubscriptionId = existingSubscriptions.at(0)?.id ?? null;
  const writePayload: CenterSubscriptionInsert & CenterSubscriptionUpdate = {
    agreed_price_amount: agreedPriceAmount,
    billing_interval: plan.interval,
    center_id: centerId,
    currency_code: plan.currency_code,
    ends_at: endsAt,
    metadata: {
      billing_interval_source: "subscription_plan_variant",
      plan_tier: planTier,
    },
    notes,
    sales_profile_id: platformAdmin.id,
    starts_at: startsAt,
    status,
    subscription_plan_id: plan.id,
    trial_ends_at: trialEndsAt,
    updated_at: updatedAt,
  };

  if (existingSubscriptionId === null) {
    const { data: insertedSubscription, error: insertError } = await supabase
      .from("center_subscriptions")
      .insert(writePayload)
      .select("id")
      .maybeSingle();

    if (insertError !== null || insertedSubscription === null) {
      return genericFailureState;
    }

    revalidatePath("/admin/center-subscriptions");

    return {
      ok: true,
      message: "Center subscription assignment was created.",
    };
  }

  const { data: updatedSubscription, error: updateError } = await supabase
    .from("center_subscriptions")
    .update(writePayload)
    .eq("id", existingSubscriptionId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedSubscription === null) {
    return genericFailureState;
  }

  revalidatePath("/admin/center-subscriptions");

  return {
    ok: true,
    message: "Center subscription assignment was updated.",
  };
}
