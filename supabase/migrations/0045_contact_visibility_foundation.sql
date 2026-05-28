-- Phase 4.6C-1: Contact Visibility Foundation
-- Purpose: add explicit public contact visibility controls with safe false defaults.

ALTER TABLE public.centers
  ADD COLUMN IF NOT EXISTS public_primary_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_secondary_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_whatsapp_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_email_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_review_status text NOT NULL DEFAULT 'not_reviewed',
  ADD COLUMN IF NOT EXISTS contact_reviewed_at timestamptz NULL;

ALTER TABLE public.center_locations
  ADD COLUMN IF NOT EXISTS public_primary_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_secondary_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_whatsapp_phone_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_email_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_review_status text NOT NULL DEFAULT 'not_reviewed',
  ADD COLUMN IF NOT EXISTS contact_reviewed_at timestamptz NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'centers_contact_review_status_check'
      AND conrelid = 'public.centers'::regclass
  ) THEN
    ALTER TABLE public.centers
      ADD CONSTRAINT centers_contact_review_status_check
      CHECK (contact_review_status IN ('not_reviewed', 'pending', 'approved', 'rejected'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'center_locations_contact_review_status_check'
      AND conrelid = 'public.center_locations'::regclass
  ) THEN
    ALTER TABLE public.center_locations
      ADD CONSTRAINT center_locations_contact_review_status_check
      CHECK (contact_review_status IN ('not_reviewed', 'pending', 'approved', 'rejected'));
  END IF;
END
$$;
