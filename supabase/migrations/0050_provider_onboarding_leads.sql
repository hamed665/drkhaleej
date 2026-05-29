-- Phase 5.2A-2A: Provider Onboarding Lead Database/RLS Foundation
-- Purpose: private B2B onboarding interest storage for later service-role API writes.

CREATE TABLE IF NOT EXISTS public.provider_onboarding_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code public.country_code NOT NULL DEFAULT 'om',
  locale public.app_locale NOT NULL DEFAULT 'en',
  center_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NULL,
  whatsapp text NULL,
  provider_type text NOT NULL DEFAULT 'other',
  area_text text NULL,
  city_text text NULL,
  preferred_language text NULL,
  message text NULL,
  consent_to_contact boolean NOT NULL DEFAULT false,
  request_source text NOT NULL DEFAULT 'for_providers_page',
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'normal',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz NULL,
  deleted_at timestamptz NULL,
  CONSTRAINT provider_onboarding_leads_country_code_check
    CHECK (country_code = 'om'),
  CONSTRAINT provider_onboarding_leads_provider_type_check
    CHECK (provider_type IN ('clinic', 'medical_center', 'dental_clinic', 'pharmacy', 'lab', 'wellness', 'other')),
  CONSTRAINT provider_onboarding_leads_status_check
    CHECK (status IN ('new', 'reviewing', 'contacted', 'qualified', 'rejected', 'converted', 'closed')),
  CONSTRAINT provider_onboarding_leads_priority_check
    CHECK (priority IN ('low', 'normal', 'high')),
  CONSTRAINT provider_onboarding_leads_center_name_length_check
    CHECK (char_length(btrim(center_name)) BETWEEN 2 AND 160),
  CONSTRAINT provider_onboarding_leads_center_name_plain_text_check
    CHECK (center_name !~* '<[^>]+>'),
  CONSTRAINT provider_onboarding_leads_contact_name_length_check
    CHECK (char_length(btrim(contact_name)) BETWEEN 2 AND 120),
  CONSTRAINT provider_onboarding_leads_contact_name_plain_text_check
    CHECK (contact_name !~* '<[^>]+>'),
  CONSTRAINT provider_onboarding_leads_phone_length_check
    CHECK (char_length(btrim(phone)) BETWEEN 6 AND 32),
  CONSTRAINT provider_onboarding_leads_email_length_check
    CHECK (email IS NULL OR char_length(btrim(email)) BETWEEN 5 AND 254),
  CONSTRAINT provider_onboarding_leads_email_basic_format_check
    CHECK (email IS NULL OR btrim(email) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT provider_onboarding_leads_whatsapp_length_check
    CHECK (whatsapp IS NULL OR char_length(btrim(whatsapp)) BETWEEN 6 AND 32),
  CONSTRAINT provider_onboarding_leads_area_text_check
    CHECK (
      area_text IS NULL
      OR (
        char_length(btrim(area_text)) BETWEEN 2 AND 120
        AND area_text !~* '<[^>]+>'
      )
    ),
  CONSTRAINT provider_onboarding_leads_city_text_check
    CHECK (
      city_text IS NULL
      OR (
        char_length(btrim(city_text)) BETWEEN 2 AND 120
        AND city_text !~* '<[^>]+>'
      )
    ),
  CONSTRAINT provider_onboarding_leads_preferred_language_check
    CHECK (
      preferred_language IS NULL
      OR (
        char_length(btrim(preferred_language)) BETWEEN 2 AND 40
        AND preferred_language !~* '<[^>]+>'
      )
    ),
  CONSTRAINT provider_onboarding_leads_message_check
    CHECK (
      message IS NULL
      OR (
        char_length(btrim(message)) <= 1000
        AND message !~* '<[^>]+>'
      )
    ),
  CONSTRAINT provider_onboarding_leads_consent_required_check
    CHECK (consent_to_contact = true),
  CONSTRAINT provider_onboarding_leads_request_source_check
    CHECK (request_source IN ('for_providers_page'))
);

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_country_code_idx
  ON public.provider_onboarding_leads(country_code);

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_status_idx
  ON public.provider_onboarding_leads(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_priority_idx
  ON public.provider_onboarding_leads(priority)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_created_at_idx
  ON public.provider_onboarding_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_open_queue_idx
  ON public.provider_onboarding_leads(status, created_at DESC)
  WHERE deleted_at IS NULL AND status IN ('new', 'reviewing', 'contacted');

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_deleted_at_idx
  ON public.provider_onboarding_leads(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_phone_idx
  ON public.provider_onboarding_leads(phone)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS provider_onboarding_leads_center_name_idx
  ON public.provider_onboarding_leads(center_name)
  WHERE deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_provider_onboarding_leads_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_provider_onboarding_leads_set_updated_at
      BEFORE UPDATE ON public.provider_onboarding_leads
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.provider_onboarding_leads ENABLE ROW LEVEL SECURITY;
