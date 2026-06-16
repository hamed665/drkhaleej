"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type SubscriptionPlanInsert =
  Database["public"]["Tables"]["subscription_plans"]["Insert"];

export type BaseSubscriptionPlanCatalogState = {
  ok: boolean;
  message: string | null;
};

const baseSubscriptionPlans: SubscriptionPlanInsert[] = [
  {
    slug: "free-listing",
    name_en: "Free Listing",
    name_ar: "القائمة المجانية",
    description_en:
      "Basic approved directory presence for providers that should be discoverable without paid subscription features.",
    description_ar:
      "ظهور أساسي معتمد في الدليل للمراكز التي يجب أن تكون قابلة للاكتشاف بدون مزايا اشتراك مدفوع.",
    price_amount: 0,
    currency_code: "OMR",
    interval: "annual",
    status: "active",
    includes_claim_badge: false,
    includes_featured_listing: false,
    includes_media_gallery: false,
    max_doctors: 0,
    max_locations: 1,
    max_services: 3,
    sort_order: 10,
    metadata: {
      plan_key: "free_listing",
      commercial_model_version: "PLAN-A",
      pricing_status: "final",
      paid_add_ons_available: true,
    },
  },
  {
    slug: "verified-starter",
    name_en: "Verified Starter",
    name_ar: "البداية الموثقة",
    description_en:
      "Trust-focused starter plan for verified providers with richer profile presentation and controlled media support.",
    description_ar:
      "خطة بداية تركز على الثقة للمراكز الموثقة مع عرض ملف أفضل ودعم وسائط مضبوط.",
    price_amount: 0,
    currency_code: "OMR",
    interval: "annual",
    status: "draft",
    includes_claim_badge: true,
    includes_featured_listing: false,
    includes_media_gallery: true,
    max_doctors: 5,
    max_locations: 1,
    max_services: 10,
    sort_order: 20,
    metadata: {
      plan_key: "verified_starter",
      commercial_model_version: "PLAN-A",
      pricing_status: "pending_final_pricing",
      paid_add_ons_available: true,
    },
  },
  {
    slug: "growth-partner",
    name_en: "Growth Partner",
    name_ar: "شريك النمو",
    description_en:
      "Growth plan for providers that need stronger profile depth, offer capacity, analytics, and lead support.",
    description_ar:
      "خطة نمو للمراكز التي تحتاج إلى ملف أعمق وسعة عروض وتحليلات ودعم للطلبات.",
    price_amount: 0,
    currency_code: "OMR",
    interval: "annual",
    status: "draft",
    includes_claim_badge: true,
    includes_featured_listing: false,
    includes_media_gallery: true,
    max_doctors: 15,
    max_locations: 3,
    max_services: 30,
    sort_order: 30,
    metadata: {
      plan_key: "growth_partner",
      commercial_model_version: "PLAN-A",
      pricing_status: "pending_final_pricing",
      paid_add_ons_available: true,
    },
  },
  {
    slug: "premium-ads-pro",
    name_en: "Premium / Ads Pro",
    name_ar: "بريميوم / إعلانات برو",
    description_en:
      "Premium commercial plan for high-visibility providers that need advanced profile support, analytics, and ad operations.",
    description_ar:
      "خطة تجارية متقدمة للمراكز التي تحتاج إلى ظهور أعلى ودعم ملف متقدم وتحليلات وتشغيل إعلانات.",
    price_amount: 0,
    currency_code: "OMR",
    interval: "annual",
    status: "draft",
    includes_claim_badge: true,
    includes_featured_listing: false,
    includes_media_gallery: true,
    max_doctors: 50,
    max_locations: 10,
    max_services: 100,
    sort_order: 40,
    metadata: {
      plan_key: "premium_ads_pro",
      commercial_model_version: "PLAN-A",
      pricing_status: "pending_final_pricing",
      paid_add_ons_available: true,
    },
  },
];

export async function initializeBaseSubscriptionPlanCatalog(
  _previousState: BaseSubscriptionPlanCatalogState,
): Promise<BaseSubscriptionPlanCatalogState> {
  await requirePlatformAdmin();

  const supabase = createSupabaseServiceRoleClient();

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
      "Base subscription plan catalog was initialized. Refresh the page to load the plan options.",
  };
}
