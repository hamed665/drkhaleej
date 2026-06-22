-- ADM-MEDIA-A: protected admin media library metadata foundation

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS updated_by_profile_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS alt_text_en text,
  ADD COLUMN IF NOT EXISTS alt_text_ar text,
  ADD COLUMN IF NOT EXISTS caption_en text,
  ADD COLUMN IF NOT EXISTS caption_ar text,
  ADD COLUMN IF NOT EXISTS admin_usage_kind text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS admin_visibility_status text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_admin_usage_kind_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets
      ADD CONSTRAINT media_assets_admin_usage_kind_check
      CHECK (admin_usage_kind IN ('general', 'logo', 'cover', 'gallery', 'profile', 'thumbnail', 'article_image', 'offer_image', 'homepage_image'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_admin_visibility_status_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets
      ADD CONSTRAINT media_assets_admin_visibility_status_check
      CHECK (admin_visibility_status IN ('private', 'public_candidate', 'public'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_alt_text_en_length_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_alt_text_en_length_check CHECK (alt_text_en IS NULL OR char_length(btrim(alt_text_en)) <= 180);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_alt_text_ar_length_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_alt_text_ar_length_check CHECK (alt_text_ar IS NULL OR char_length(btrim(alt_text_ar)) <= 180);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_caption_en_length_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_caption_en_length_check CHECK (caption_en IS NULL OR char_length(btrim(caption_en)) <= 300);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_assets_caption_ar_length_check' AND conrelid = 'public.media_assets'::regclass) THEN
    ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_caption_ar_length_check CHECK (caption_ar IS NULL OR char_length(btrim(caption_ar)) <= 300);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS media_assets_created_at_desc_idx ON public.media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_admin_usage_kind_idx ON public.media_assets(admin_usage_kind);
CREATE INDEX IF NOT EXISTS media_assets_admin_visibility_status_idx ON public.media_assets(admin_visibility_status);
CREATE INDEX IF NOT EXISTS media_assets_is_archived_idx ON public.media_assets(is_archived);
CREATE INDEX IF NOT EXISTS media_assets_updated_by_profile_id_idx ON public.media_assets(updated_by_profile_id) WHERE updated_by_profile_id IS NOT NULL;
