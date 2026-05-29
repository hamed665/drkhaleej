-- Phase 4.6F-1: entity_media public visibility and review hardening

ALTER TABLE public.entity_media
  ADD COLUMN IF NOT EXISTS public_media_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_review_status text NOT NULL DEFAULT 'not_reviewed',
  ADD COLUMN IF NOT EXISTS media_reviewed_at timestamptz NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_media_review_status_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_media_review_status_check
      CHECK (media_review_status IN ('not_reviewed', 'pending', 'approved', 'rejected'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_public_visible_requires_approved_review_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_public_visible_requires_approved_review_check
      CHECK (public_media_visible = false OR media_review_status = 'approved');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_reviewed_at_status_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_reviewed_at_status_check
      CHECK (media_reviewed_at IS NULL OR media_review_status IN ('approved', 'rejected'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_alt_text_en_length_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_alt_text_en_length_check
      CHECK (alt_text_en IS NULL OR char_length(btrim(alt_text_en)) <= 180);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_alt_text_ar_length_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_alt_text_ar_length_check
      CHECK (alt_text_ar IS NULL OR char_length(btrim(alt_text_ar)) <= 180);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_caption_en_length_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_caption_en_length_check
      CHECK (caption_en IS NULL OR char_length(btrim(caption_en)) <= 300);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_caption_ar_length_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_caption_ar_length_check
      CHECK (caption_ar IS NULL OR char_length(btrim(caption_ar)) <= 300);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_alt_text_en_plain_text_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_alt_text_en_plain_text_check
      CHECK (alt_text_en IS NULL OR alt_text_en !~* '<[^>]+>');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_alt_text_ar_plain_text_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_alt_text_ar_plain_text_check
      CHECK (alt_text_ar IS NULL OR alt_text_ar !~* '<[^>]+>');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_caption_en_plain_text_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_caption_en_plain_text_check
      CHECK (caption_en IS NULL OR caption_en !~* '<[^>]+>');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'entity_media_caption_ar_plain_text_check'
      AND conrelid = 'public.entity_media'::regclass
  ) THEN
    ALTER TABLE public.entity_media
      ADD CONSTRAINT entity_media_caption_ar_plain_text_check
      CHECK (caption_ar IS NULL OR caption_ar !~* '<[^>]+>');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS entity_media_public_entity_visible_idx
  ON public.entity_media(entity_type, entity_id, usage_kind, sort_order)
  WHERE deleted_at IS NULL AND public_media_visible = true;

CREATE INDEX IF NOT EXISTS entity_media_public_primary_idx
  ON public.entity_media(entity_type, entity_id, usage_kind)
  WHERE deleted_at IS NULL AND public_media_visible = true AND is_primary = true;

CREATE INDEX IF NOT EXISTS entity_media_media_review_status_idx
  ON public.entity_media(media_review_status)
  WHERE deleted_at IS NULL;
