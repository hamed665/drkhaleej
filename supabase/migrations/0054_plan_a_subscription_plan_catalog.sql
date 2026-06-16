-- PLAN-A: DrMuscat base subscription plan catalog
--
-- Purpose:
-- - Upsert the official base commercial plan catalog used by admin flows.
-- - This is product catalog data, not fake provider/center/review data.
-- - Paid plan pricing is intentionally left at 0.000 while commercial pricing
--   remains pending final approval.
--
-- Guardrails:
-- - No RLS policy changes.
-- - No schema changes.
-- - No public access changes.
-- - No payment, invoice, add-on, ad, offer, or provider-dashboard behavior.

merge into public.subscription_plans as target
using (
  values
    (
      'free-listing',
      'Free Listing',
      'القائمة المجانية',
      'Basic approved directory presence for providers that should be discoverable without paid subscription features.',
      'ظهور أساسي معتمد في الدليل للمراكز التي يجب أن تكون قابلة للاكتشاف بدون مزايا اشتراك مدفوع.',
      0.000::numeric,
      'OMR',
      'annual'::public.plan_interval,
      'active'::public.subscription_plan_status,
      false,
      false,
      false,
      0::integer,
      1::integer,
      3::integer,
      10::integer,
      jsonb_build_object(
        'plan_key', 'free_listing',
        'commercial_model_version', 'PLAN-A',
        'pricing_status', 'final',
        'paid_add_ons_available', true,
        'notes', 'Free listings may still purchase approved paid add-ons separately.'
      )
    ),
    (
      'verified-starter',
      'Verified Starter',
      'البداية الموثقة',
      'Trust-focused starter plan for verified providers with richer profile presentation and controlled media support.',
      'خطة بداية تركز على الثقة للمراكز الموثقة مع عرض ملف أفضل ودعم وسائط مضبوط.',
      0.000::numeric,
      'OMR',
      'annual'::public.plan_interval,
      'draft'::public.subscription_plan_status,
      true,
      false,
      true,
      5::integer,
      1::integer,
      10::integer,
      20::integer,
      jsonb_build_object(
        'plan_key', 'verified_starter',
        'commercial_model_version', 'PLAN-A',
        'pricing_status', 'pending_final_pricing',
        'paid_add_ons_available', true,
        'notes', 'Base subscription plan only; sponsored placements remain separately purchasable add-ons.'
      )
    ),
    (
      'growth-partner',
      'Growth Partner',
      'شريك النمو',
      'Growth plan for providers that need stronger profile depth, offer capacity, analytics, and lead support.',
      'خطة نمو للمراكز التي تحتاج إلى ملف أعمق وسعة عروض وتحليلات ودعم للطلبات.',
      0.000::numeric,
      'OMR',
      'annual'::public.plan_interval,
      'draft'::public.subscription_plan_status,
      true,
      false,
      true,
      15::integer,
      3::integer,
      30::integer,
      30::integer,
      jsonb_build_object(
        'plan_key', 'growth_partner',
        'commercial_model_version', 'PLAN-A',
        'pricing_status', 'pending_final_pricing',
        'paid_add_ons_available', true,
        'notes', 'Growth plan may later include bundled or discounted placement credits after explicit approval.'
      )
    ),
    (
      'premium-ads-pro',
      'Premium / Ads Pro',
      'بريميوم / إعلانات برو',
      'Premium commercial plan for high-visibility providers that need advanced profile support, analytics, and ad operations.',
      'خطة تجارية متقدمة للمراكز التي تحتاج إلى ظهور أعلى ودعم ملف متقدم وتحليلات وتشغيل إعلانات.',
      0.000::numeric,
      'OMR',
      'annual'::public.plan_interval,
      'draft'::public.subscription_plan_status,
      true,
      false,
      true,
      50::integer,
      10::integer,
      100::integer,
      40::integer,
      jsonb_build_object(
        'plan_key', 'premium_ads_pro',
        'commercial_model_version', 'PLAN-A',
        'pricing_status', 'pending_final_pricing',
        'paid_add_ons_available', true,
        'notes', 'Premium plan does not silently grant hidden ranking; paid placements must remain labeled commercial surfaces.'
      )
    )
) as source(
  slug,
  name_en,
  name_ar,
  description_en,
  description_ar,
  price_amount,
  currency_code,
  interval,
  status,
  includes_claim_badge,
  includes_featured_listing,
  includes_media_gallery,
  max_doctors,
  max_locations,
  max_services,
  sort_order,
  metadata
)
on target.slug = source.slug
when matched then
  update set
    name_en = source.name_en,
    name_ar = source.name_ar,
    description_en = source.description_en,
    description_ar = source.description_ar,
    price_amount = source.price_amount,
    currency_code = source.currency_code,
    interval = source.interval,
    status = source.status,
    includes_claim_badge = source.includes_claim_badge,
    includes_featured_listing = source.includes_featured_listing,
    includes_media_gallery = source.includes_media_gallery,
    max_doctors = source.max_doctors,
    max_locations = source.max_locations,
    max_services = source.max_services,
    sort_order = source.sort_order,
    metadata = source.metadata,
    deleted_at = null,
    updated_at = now()
when not matched then
  insert (
    slug,
    name_en,
    name_ar,
    description_en,
    description_ar,
    price_amount,
    currency_code,
    interval,
    status,
    includes_claim_badge,
    includes_featured_listing,
    includes_media_gallery,
    max_doctors,
    max_locations,
    max_services,
    sort_order,
    metadata
  )
  values (
    source.slug,
    source.name_en,
    source.name_ar,
    source.description_en,
    source.description_ar,
    source.price_amount,
    source.currency_code,
    source.interval,
    source.status,
    source.includes_claim_badge,
    source.includes_featured_listing,
    source.includes_media_gallery,
    source.max_doctors,
    source.max_locations,
    source.max_services,
    source.sort_order,
    source.metadata
  );
