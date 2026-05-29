-- Phase 4.6D-1: Callback Request Database Foundation
-- Purpose: private storage foundation for future controlled follow-up requests.

CREATE TABLE IF NOT EXISTS public.callback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code public.country_code NOT NULL DEFAULT 'om',
  locale public.app_locale NOT NULL DEFAULT 'en',
  center_id uuid NOT NULL REFERENCES public.centers(id),
  center_location_id uuid NULL REFERENCES public.center_locations(id),
  doctor_id uuid NULL REFERENCES public.doctors(id),
  doctor_practice_location_id uuid NULL REFERENCES public.doctor_practice_locations(id),
  profile_id uuid NULL REFERENCES public.profiles(id),
  requester_name text NOT NULL,
  requester_phone text NOT NULL,
  preferred_language text NULL,
  message text NULL,
  consent_to_contact boolean NOT NULL DEFAULT false,
  request_source text NOT NULL DEFAULT 'public_profile',
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'normal',
  handled_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT callback_requests_requester_name_not_empty_check
    CHECK (btrim(requester_name) <> ''),
  CONSTRAINT callback_requests_requester_name_length_check
    CHECK (char_length(btrim(requester_name)) BETWEEN 2 AND 120),
  CONSTRAINT callback_requests_requester_phone_not_empty_check
    CHECK (btrim(requester_phone) <> ''),
  CONSTRAINT callback_requests_requester_phone_length_check
    CHECK (char_length(btrim(requester_phone)) BETWEEN 6 AND 32),
  CONSTRAINT callback_requests_preferred_language_length_check
    CHECK (preferred_language IS NULL OR char_length(btrim(preferred_language)) BETWEEN 2 AND 40),
  CONSTRAINT callback_requests_message_length_check
    CHECK (message IS NULL OR char_length(btrim(message)) <= 500),
  CONSTRAINT callback_requests_consent_to_contact_check
    CHECK (consent_to_contact = true),
  CONSTRAINT callback_requests_request_source_check
    CHECK (request_source IN ('public_profile')),
  CONSTRAINT callback_requests_status_check
    CHECK (status IN ('new', 'viewed', 'contacted', 'unreachable', 'closed', 'spam', 'rejected')),
  CONSTRAINT callback_requests_priority_check
    CHECK (priority IN ('normal', 'high')),
  CONSTRAINT callback_requests_message_plain_text_check
    CHECK (message IS NULL OR message !~* '<[^>]+>')
);

CREATE INDEX IF NOT EXISTS callback_requests_center_id_idx
  ON public.callback_requests(center_id);

CREATE INDEX IF NOT EXISTS callback_requests_center_location_id_idx
  ON public.callback_requests(center_location_id)
  WHERE center_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS callback_requests_doctor_id_idx
  ON public.callback_requests(doctor_id)
  WHERE doctor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS callback_requests_doctor_practice_location_id_idx
  ON public.callback_requests(doctor_practice_location_id)
  WHERE doctor_practice_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS callback_requests_profile_id_idx
  ON public.callback_requests(profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS callback_requests_status_idx
  ON public.callback_requests(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS callback_requests_priority_idx
  ON public.callback_requests(priority)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS callback_requests_created_at_idx
  ON public.callback_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS callback_requests_country_code_idx
  ON public.callback_requests(country_code);

CREATE INDEX IF NOT EXISTS callback_requests_open_queue_idx
  ON public.callback_requests(status, created_at DESC)
  WHERE deleted_at IS NULL AND status IN ('new', 'viewed', 'unreachable');

CREATE INDEX IF NOT EXISTS callback_requests_deleted_at_idx
  ON public.callback_requests(deleted_at)
  WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_callback_requests_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_callback_requests_set_updated_at
      BEFORE UPDATE ON public.callback_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
