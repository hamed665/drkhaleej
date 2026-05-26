DO $$
BEGIN
  CREATE TYPE subscription_plan_status AS ENUM ('draft', 'active', 'inactive', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_ar text NULL,
  description_en text NULL,
  description_ar text NULL,
  status subscription_plan_status NOT NULL DEFAULT 'draft',
  interval plan_interval NOT NULL DEFAULT 'monthly',
  price_amount numeric(12,3) NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'OMR',
  max_locations integer NULL,
  max_doctors integer NULL,
  max_services integer NULL,
  includes_featured_listing boolean NOT NULL DEFAULT false,
  includes_media_gallery boolean NOT NULL DEFAULT true,
  includes_claim_badge boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT subscription_plans_name_en_not_empty CHECK (btrim(name_en) <> ''),
  CONSTRAINT subscription_plans_price_amount_non_negative CHECK (price_amount >= 0),
  CONSTRAINT subscription_plans_currency_code_not_empty CHECK (btrim(currency_code) <> ''),
  CONSTRAINT subscription_plans_max_locations_non_negative CHECK (max_locations IS NULL OR max_locations >= 0),
  CONSTRAINT subscription_plans_max_doctors_non_negative CHECK (max_doctors IS NULL OR max_doctors >= 0),
  CONSTRAINT subscription_plans_max_services_non_negative CHECK (max_services IS NULL OR max_services >= 0)
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON public.subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_interval ON public.subscription_plans(interval);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_currency_code ON public.subscription_plans(currency_code);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_deleted_at ON public.subscription_plans(deleted_at) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_subscription_plans_updated_at'
  ) THEN
    CREATE TRIGGER set_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
