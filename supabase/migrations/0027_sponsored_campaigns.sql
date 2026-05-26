DO $$
BEGIN
  CREATE TYPE sponsored_campaign_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.sponsored_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  created_by_profile_id uuid NULL REFERENCES public.profiles(id),
  title_en text NOT NULL,
  title_ar text NULL,
  status sponsored_campaign_status NOT NULL DEFAULT 'draft',
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  budget_amount numeric(12,3) NULL,
  currency_code text NOT NULL DEFAULT 'OMR',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT sponsored_campaigns_title_en_not_empty CHECK (btrim(title_en) <> ''),
  CONSTRAINT sponsored_campaigns_budget_non_negative CHECK (budget_amount IS NULL OR budget_amount >= 0),
  CONSTRAINT sponsored_campaigns_currency_code_not_empty CHECK (btrim(currency_code) <> ''),
  CONSTRAINT sponsored_campaigns_ends_at_gte_starts_at CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS public.sponsored_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.sponsored_campaigns(id),
  slot_type sponsored_slot_type NOT NULL DEFAULT 'sponsored_result',
  target_center_id uuid NULL REFERENCES public.centers(id),
  target_doctor_id uuid NULL REFERENCES public.doctors(id),
  target_center_service_id uuid NULL REFERENCES public.center_services(id),
  target_doctor_service_id uuid NULL REFERENCES public.doctor_services(id),
  country_code country_code NOT NULL DEFAULT 'om',
  locale app_locale NULL,
  placement_key text NULL,
  priority integer NOT NULL DEFAULT 0,
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT sponsored_placements_target_presence_check CHECK (
    target_center_id IS NOT NULL
    OR target_doctor_id IS NOT NULL
    OR target_center_service_id IS NOT NULL
    OR target_doctor_service_id IS NOT NULL
  ),
  CONSTRAINT sponsored_placements_ends_at_gte_starts_at CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_center_id ON public.sponsored_campaigns(center_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_created_by_profile_id ON public.sponsored_campaigns(created_by_profile_id) WHERE created_by_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_status ON public.sponsored_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_starts_at ON public.sponsored_campaigns(starts_at);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_ends_at ON public.sponsored_campaigns(ends_at);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_deleted_at ON public.sponsored_campaigns(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sponsored_placements_campaign_id ON public.sponsored_placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_slot_type ON public.sponsored_placements(slot_type);
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_target_center_id ON public.sponsored_placements(target_center_id) WHERE target_center_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_target_doctor_id ON public.sponsored_placements(target_doctor_id) WHERE target_doctor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_target_center_service_id ON public.sponsored_placements(target_center_service_id) WHERE target_center_service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_target_doctor_service_id ON public.sponsored_placements(target_doctor_service_id) WHERE target_doctor_service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_country_code ON public.sponsored_placements(country_code);
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_locale ON public.sponsored_placements(locale) WHERE locale IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_is_active ON public.sponsored_placements(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsored_placements_deleted_at ON public.sponsored_placements(deleted_at) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_sponsored_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER set_sponsored_campaigns_updated_at
    BEFORE UPDATE ON public.sponsored_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_sponsored_placements_updated_at'
  ) THEN
    CREATE TRIGGER set_sponsored_placements_updated_at
    BEFORE UPDATE ON public.sponsored_placements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
