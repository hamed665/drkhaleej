-- Phase 2.7B: entity media foundation only
DO $$
BEGIN
  CREATE TYPE media_entity_type AS ENUM (
    'center',
    'center_location',
    'doctor',
    'service',
    'center_service',
    'doctor_service',
    'review'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE media_usage_kind AS ENUM (
    'logo',
    'cover',
    'profile',
    'gallery',
    'menu',
    'certificate',
    'document',
    'before_after',
    'thumbnail',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.entity_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id uuid NOT NULL REFERENCES public.media_assets(id),
  entity_type media_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  usage_kind media_usage_kind NOT NULL DEFAULT 'gallery',
  alt_text_en text NULL,
  alt_text_ar text NULL,
  caption_en text NULL,
  caption_ar text NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS entity_media_media_asset_id_idx ON public.entity_media(media_asset_id);
CREATE INDEX IF NOT EXISTS entity_media_entity_type_entity_id_idx ON public.entity_media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS entity_media_entity_type_entity_id_usage_kind_idx ON public.entity_media(entity_type, entity_id, usage_kind);
CREATE INDEX IF NOT EXISTS entity_media_usage_kind_idx ON public.entity_media(usage_kind);
CREATE INDEX IF NOT EXISTS entity_media_is_primary_idx ON public.entity_media(is_primary);
CREATE INDEX IF NOT EXISTS entity_media_is_featured_idx ON public.entity_media(is_featured);
CREATE INDEX IF NOT EXISTS entity_media_deleted_at_idx ON public.entity_media(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS entity_media_primary_per_usage_non_gallery_unique_idx
  ON public.entity_media(entity_type, entity_id, usage_kind)
  WHERE is_primary = true AND usage_kind <> 'gallery' AND deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_entity_media_updated_at'
  ) THEN
    CREATE TRIGGER set_entity_media_updated_at
    BEFORE UPDATE ON public.entity_media
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
