-- REL-DOCTOR-A: doctor multi-practice relation hardening
-- Purpose: add reviewed relation metadata to doctor_practice_locations without public exposure.

ALTER TABLE public.doctor_practice_locations
  ADD COLUMN IF NOT EXISTS practice_type text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS relation_review_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS public_relation_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_url text NULL,
  ADD COLUMN IF NOT EXISTS source_name text NULL,
  ADD COLUMN IF NOT EXISTS source_type text NULL,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS confidence_score numeric(5,2) NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS review_note text NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_practice_type_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_practice_type_check
      CHECK (practice_type IN ('hospital_staff', 'clinic_staff', 'private_practice', 'visiting_consultant', 'department_member', 'unknown'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_relation_review_status_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_relation_review_status_check
      CHECK (relation_review_status IN ('draft', 'pending_review', 'approved', 'rejected', 'hold', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_source_type_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_source_type_check
      CHECK (source_type IS NULL OR source_type IN ('official_website', 'provider_submitted', 'public_directory', 'social_profile', 'imported_source', 'manual_review', 'unknown'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_source_url_format_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_source_url_format_check
      CHECK (source_url IS NULL OR source_url ~* '^https?://[^\s]+$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_confidence_score_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_confidence_score_check
      CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_review_note_length_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_review_note_length_check
      CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_approved_review_metadata_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_approved_review_metadata_check
      CHECK (
        relation_review_status <> 'approved'
        OR (reviewed_by_profile_id IS NOT NULL AND reviewed_at IS NOT NULL)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctor_practice_locations_public_visible_gate_check' AND conrelid = 'public.doctor_practice_locations'::regclass
  ) THEN
    ALTER TABLE public.doctor_practice_locations
      ADD CONSTRAINT doctor_practice_locations_public_visible_gate_check
      CHECK (
        public_relation_visible = false
        OR (
          relation_review_status = 'approved'
          AND last_checked_at IS NOT NULL
          AND (source_url IS NOT NULL OR source_name IS NOT NULL)
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS doctor_practice_locations_practice_type_idx
  ON public.doctor_practice_locations (practice_type);

CREATE INDEX IF NOT EXISTS doctor_practice_locations_relation_review_status_idx
  ON public.doctor_practice_locations (relation_review_status);

CREATE INDEX IF NOT EXISTS doctor_practice_locations_public_relation_visible_idx
  ON public.doctor_practice_locations (public_relation_visible)
  WHERE public_relation_visible = true;

CREATE INDEX IF NOT EXISTS doctor_practice_locations_last_checked_at_idx
  ON public.doctor_practice_locations (last_checked_at)
  WHERE last_checked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS doctor_practice_locations_reviewed_by_profile_id_idx
  ON public.doctor_practice_locations (reviewed_by_profile_id)
  WHERE reviewed_by_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS doctor_practice_locations_source_url_idx
  ON public.doctor_practice_locations (source_url)
  WHERE source_url IS NOT NULL;
