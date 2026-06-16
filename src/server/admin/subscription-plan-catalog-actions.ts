"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type SubscriptionPlanInsert =
  Database["public"]["Tables"]["subscription_plans"]["Insert"];
type PlanInterval = Database["public"]["Enums"]["plan_interval"];
type SubscriptionPlanStatus =
  Database["public"]["Enums"]["subscription_plan_status"];

export type BaseSubscriptionPlanCatalogState = {
  ok: boolean;
  message: string | null;
};

const legacyPremiumAdsProSlug = "premium-ads-pro";
const premiumPartnerSlug = "premium-partner";

const addOnPolicy =
  "Homepage ads and Special Offer placements are separate paid products available across plans.";

const intervalLabels: Record<PlanInterval, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annual: "Semi Annual",
  annual: "Annual",
};

const intervalSortOrder: Record<PlanInterval, number> = {
  monthly: 1,
  quarterly: 2,
  semi_annual: 3,
  annual: 4,
};

function slugForInterval(baseSlug: string, interval: PlanInterval): string {
  if (interval === "annual") return baseSlug;
  if (interval === "semi_annual") return `${baseSlug}-semi-annual`;

  return `${baseSlug}-${interval}`;
}

function planKeyForInterval(planKey: string, interval: PlanInterval): string {
  return `${planKey}_${interval}`;
}

function createSubscriptionPlan({
  baseSlug,
  nameAr,
  nameEn,
  descriptionAr,
  descriptionEn,
  interval,
  includesClaimBadge,
  includesMediaGallery,
  maxDoctors,
  maxLocations,
  maxServices,
  planKey,
  planTier,
  sortGroup,
  status,
}: {
  baseSlug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  interval: PlanInterval;
  includesClaimBadge: boolean;
  includesMediaGallery: boolean;
  maxDoctors: number;
  maxLocations: number;
  maxServices: number;
  planKey: string;
  planTier: string;
  sortGroup: number;
  status: SubscriptionPlanStatus;
}): SubscriptionPlanInsert {
  const intervalLabel = intervalLabels[interval];
  const slug = slugForInterval(baseSlug, interval);
  const isAnnual = interval === "annual";

  return {
    slug,
    name_en: isAnnual ? nameEn : `${nameEn} · ${intervalLabel}`,
    name_ar: isAnnual ? nameAr : `${nameAr} · ${intervalLabel}`,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price_amount: 0,
    currency_code: "OMR",
    interval,
    status,
    includes_claim_badge: includesClaimBadge,
    includes_featured_listing: false,
    includes_media_gallery: includesMediaGallery,
    max_doctors: maxDoctors,
    max_locations: maxLocations,
    max_services: maxServices,
    sort_order: sortGroup * 100 + intervalSortOrder[interval],
    metadata: {
      add_on_policy: addOnPolicy,
      billing_term: interval,
      commercial_model_version: "PLAN-A2",
      paid_add_ons_available: true,
      plan_key: planKeyForInterval(planKey, interval),
      plan_tier: planTier,
      pricing_status: status === "inactive" ? "future_option" : "pending_final_pricing",
      storefront_visibility: status === "inactive" ? "hidden" : "admin_assignment_available",
    },
  };
}

const baseSubscriptionPlans: SubscriptionPlanInsert[] = [
  createSubscriptionPlan({
    baseSlug: "free-listing",
    nameEn: "Free Listing",
    nameAr: "القائمة المجانية",
    descriptionEn:
      "Basic approved directory presence for providers that should be discoverable without paid subscription features.",
    descriptionAr:
      "ظهور أساسي معتمد في الدليل للمراكز التي يجب أن تكون قابلة للاكتشاف بدون مزايا اشتراك مدفوع.",
    interval: "annual",
    includesClaimBadge: false,
    includesMediaGallery: false,
    maxDoctors: 0,
    maxLocations: 1,
    maxServices: 3,
    planKey: "free_listing",
    planTier: "free_listing",
    sortGroup: 10,
    status: "active",
  }),
  ...(["monthly", "quarterly", "semi_annual", "annual"] as const).map(
    (interval) =>
      createSubscriptionPlan({
        baseSlug: "verified-starter",
        nameEn: "Verified Starter",
        nameAr: "البداية الموثقة",
        descriptionEn:
          "Trust-focused starter plan for verified providers with richer profile presentation and controlled media support.",
        descriptionAr:
          "خطة بداية تركز على الثقة للمراكز الموثقة مع عرض ملف أفضل ودعم وسائط مضبوط.",
        interval,
        includesClaimBadge: true,
        includesMediaGallery: true,
        maxDoctors: 5,
        maxLocations: 1,
        maxServices: 10,
        planKey: "verified_starter",
        planTier: "verified_starter",
        sortGroup: 20,
        status: interval === "monthly" ? "inactive" : "draft",
      }),
  ),
  ...(["monthly", "quarterly", "semi_annual", "annual"] as const).map(
    (interval) =>
      createSubscriptionPlan({
        baseSlug: "growth-partner",
        nameEn: "Growth Partner",
        nameAr: "شريك النمو",
        descriptionEn:
          "Growth plan for providers that need stronger profile depth, offer capacity, analytics, and lead support.",
        descriptionAr:
          "خطة نمو للمراكز التي تحتاج إلى ملف أعمق وسعة عروض وتحليلات ودعم للطلبات.",
        interval,
        includesClaimBadge: true,
        includesMediaGallery: true,
        maxDoctors: 15,
        maxLocations: 3,
        maxServices: 30,
        planKey: "growth_partner",
        planTier: "growth_partner",
        sortGroup: 30,
        status: interval === "monthly" ? "inactive" : "draft",
      }),
  ),
  ...(["monthly", "quarterly", "semi_annual", "annual"] as const).map(
    (interval) =>
      createSubscriptionPlan({
        baseSlug: premiumPartnerSlug,
        nameEn: "Premium Partner",
        nameAr: "الشريك المميز",
        descriptionEn:
          "Premium commercial plan for providers that need advanced profile support, richer capacity, analytics, and account operations. Paid ads and Special Offer placements remain separate add-ons available across plans.",
        descriptionAr:
          "خطة تجارية مميزة للمراكز التي تحتاج إلى دعم ملف متقدم وسعة أكبر وتحليلات وتشغيل حساب. الإعلانات المدفوعة ومواضع العروض الخاصة تبقى إضافات منفصلة متاحة عبر الخطط.",
        interval,
        includesClaimBadge: true,
        includesMediaGallery: true,
        maxDoctors: 50,
        maxLocations: 10,
        maxServices: 100,
        planKey: "premium_partner",
        planTier: "premium_partner",
        sortGroup: 40,
        status: interval === "monthly" ? "inactive" : "draft",
      }),
  ),
];

export async function initializeBaseSubscriptionPlanCatalog(
  _previousState: BaseSubscriptionPlanCatalogState,
  _formData: FormData,
): Promise<BaseSubscriptionPlanCatalogState> {
  await requirePlatformAdmin();

  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  const { data: existingPremiumPartner, error: existingPremiumPartnerError } =
    await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", premiumPartnerSlug)
      .is("deleted_at", null)
      .maybeSingle();

  if (existingPremiumPartnerError !== null) {
    return {
      ok: false,
      message: "Base subscription plan catalog could not be initialized.",
    };
  }

  if (existingPremiumPartner === null) {
    const { error: legacyRenameError } = await supabase
      .from("subscription_plans")
      .update({ slug: premiumPartnerSlug, updated_at: now })
      .eq("slug", legacyPremiumAdsProSlug)
      .is("deleted_at", null);

    if (legacyRenameError !== null) {
      return {
        ok: false,
        message: "Base subscription plan catalog could not be initialized.",
      };
    }
  } else {
    const { error: legacyArchiveError } = await supabase
      .from("subscription_plans")
      .update({
        deleted_at: now,
        status: "archived",
        updated_at: now,
      })
      .eq("slug", legacyPremiumAdsProSlug)
      .is("deleted_at", null);

    if (legacyArchiveError !== null) {
      return {
        ok: false,
        message: "Base subscription plan catalog could not be initialized.",
      };
    }
  }

  const { error } = await supabase
    .from("subscription_plans")
    .upsert(baseSubscriptionPlans, { onConflict: "slug" });

  if (error !== null) {
    return {
      ok: false,
      message: "Base subscription plan catalog could not be initialized.",
    };
  }

  revalidatePath("/admin/center-subscriptions");

  return {
    ok: true,
    message:
      "Base subscription plan catalog was synced with billing-term variants. Refresh the page to load the current plan options.",
  };
}
