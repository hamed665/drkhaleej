-- SEO-D3H4-C-IMPL-A: Landing Content Migration Foundation
-- Purpose: private landing page content storage with lifecycle/review gates.
-- Scope: schema foundation only. RLS is enabled without access policies.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landing_page_family') THEN
    CREATE TYPE public.landing_page_family AS ENUM (
      'specialty',
      'specialty_area',
      'area',
      'service',
      'service_area'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landing_content_status') THEN
    CREATE TYPE public.landing_content_status AS ENUM (
      'draft',
      'in_review',
      'approved',
      'published',
      'archived',
      'rejected'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landing_editorial_review_status') THEN
    CREATE TYPE public.landing_editorial_review_status AS ENUM (
      'missing',
      'pending',
      'approved',
      'rejected'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landing_medical_review_status') THEN
    CREATE TYPE public.landing_medical_review_status AS ENUM (
      'missing',
      'not_required',
      'required',
      'pending',
      'approved',
      'rejected'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.landing_page_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale public.app_locale NOT NULL,
  country_code public.country_code NOT NULL DEFAULT 'om',
  family public.landing_page_family NOT NULL,
  service_id uuid NULL REFERENCES public.services(id),
  specialty_id uuid NULL REFERENCES public.specialties(id),
  area_id uuid NULL REFERENCES public.geo_areas(id),
  city_id uuid NULL REFERENCES public.geo_cities(id),
  canonical_landing_key text NOT NULL,
  canonical_area_key text NULL,
  title text NULL,
  intro text NULL,
  sections jsonb NULL,
  faq jsonb NULL,
  status public.landing_content_status NOT NULL DEFAULT 'draft',
  editorial_review_status public.landing_editorial_review_status NOT NULL DEFAULT 'missing',
  medical_review_status public.landing_medical_review_status NOT NULL DEFAULT 'missing',
  is_medical boolean NOT NULL DEFAULT true,
  requires_medical_review boolean NOT NULL DEFAULT true,
  created_by_profile_id uuid NULL REFERENCES public.profiles(id),
  updated_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  medical_reviewer_profile_id uuid NULL REFERENCES public.profiles(id),
  medical_reviewed_at timestamptz NULL,
  published_by_profile_id uuid NULL REFERENCES public.profiles(id),
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT landing_page_contents_country_code_check
    CHECK (country_code = 'om'),
  CONSTRAINT landing_page_contents_canonical_landing_key_length_check
    CHECK (char_length(btrim(canonical_landing_key)) BETWEEN 3 AND 240),
  CONSTRAINT landing_page_contents_canonical_landing_key_safe_check
    CHECK (canonical_landing_key !~* '<[^>]+>'),
  CONSTRAINT landing_page_contents_canonical_area_key_check
    CHECK (
      canonical_area_key IS NULL
      OR (
        char_length(btrim(canonical_area_key)) BETWEEN 3 AND 240
        AND canonical_area_key !~* '<[^>]+>'
      )
    ),
  CONSTRAINT landing_page_contents_title_check
    CHECK (
      title IS NULL
      OR (
        char_length(btrim(title)) BETWEEN 3 AND 180
        AND title !~* '<[^>]+>'
      )
    ),
  CONSTRAINT landing_page_contents_intro_check
    CHECK (
      intro IS NULL
      OR (
        char_length(btrim(intro)) BETWEEN 40 AND 3000
        AND intro !~* '<[^>]+>'
      )
    ),
  CONSTRAINT landing_page_contents_sections_object_check
    CHECK (sections IS NULL OR jsonb_typeof(sections) = 'object'),
  CONSTRAINT landing_page_contents_faq_array_check
    CHECK (faq IS NULL OR jsonb_typeof(faq) = 'array'),
  CONSTRAINT landing_page_contents_family_scope_check
    CHECK (
      (
        family = 'service'
        AND service_id IS NOT NULL
        AND specialty_id IS NULL
        AND area_id IS NULL
        AND city_id IS NULL
        AND canonical_area_key IS NULL
      )
      OR (
        family = 'service_area'
        AND service_id IS NOT NULL
        AND specialty_id IS NULL
        AND area_id IS NOT NULL
        AND city_id IS NOT NULL
      )
      OR (
        family = 'specialty'
        AND specialty_id IS NOT NULL
        AND service_id IS NULL
        AND area_id IS NULL
        AND city_id IS NULL
        AND canonical_area_key IS NULL
      )
      OR (
        family = 'specialty_area'
        AND specialty_id IS NOT NULL
        AND service_id IS NULL
        AND area_id IS NOT NULL
        AND city_id IS NOT NULL
      )
      OR (
        family = 'area'
        AND service_id IS NULL
        AND specialty_id IS NULL
        AND area_id IS NOT NULL
        AND city_id IS NOT NULL
      )
    ),
  CONSTRAINT landing_page_contents_reviewed_at_status_check
    CHECK (reviewed_at IS NULL OR editorial_review_status IN ('approved', 'rejected')),
  CONSTRAINT landing_page_contents_medical_reviewed_at_status_check
    CHECK (medical_reviewed_at IS NULL OR medical_review_status IN ('approved', 'rejected', 'not_required')),
  CONSTRAINT landing_page_contents_medical_review_requirement_check
    CHECK (
      (requires_medical_review = true AND medical_review_status <> 'not_required')
      OR (requires_medical_review = false)
    ),
  CONSTRAINT landing_page_contents_approved_status_check
    CHECK (
      status <> 'approved'
      OR (
        editorial_review_status = 'approved'
        AND medical_review_status IN ('approved', 'not_required')
        AND title IS NOT NULL
        AND btrim(title) <> ''
        AND intro IS NOT NULL
        AND btrim(intro) <> ''
        AND deleted_at IS NULL
      )
    ),
  CONSTRAINT landing_page_contents_published_status_check
    CHECK (
      status <> 'published'
      OR (
        editorial_review_status = 'approved'
        AND medical_review_status IN ('approved', 'not_required')
        AND title IS NOT NULL
        AND btrim(title) <> ''
        AND intro IS NOT NULL
        AND btrim(intro) <> ''
        AND published_at IS NOT NULL
        AND published_by_profile_id IS NOT NULL
        AND deleted_at IS NULL
      )
    ),
  CONSTRAINT landing_page_contents_unpublished_publication_fields_check
    CHECK (
      status = 'published'
      OR (published_at IS NULL AND published_by_profile_id IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS landing_page_contents_one_live_published_key_idx
  ON public.landing_page_contents(locale, country_code, family, canonical_landing_key)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_public_lookup_idx
  ON public.landing_page_contents(locale, country_code, family, canonical_landing_key, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_service_id_idx
  ON public.landing_page_contents(service_id)
  WHERE service_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_specialty_id_idx
  ON public.landing_page_contents(specialty_id)
  WHERE specialty_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_area_city_idx
  ON public.landing_page_contents(area_id, city_id)
  WHERE area_id IS NOT NULL AND city_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_review_queue_idx
  ON public.landing_page_contents(status, editorial_review_status, medical_review_status, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_published_at_idx
  ON public.landing_page_contents(published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS landing_page_contents_deleted_at_idx
  ON public.landing_page_contents(deleted_at)
  WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_landing_page_contents_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_landing_page_contents_set_updated_at
      BEFORE UPDATE ON public.landing_page_contents
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.landing_page_contents ENABLE ROW LEVEL SECURITY;
