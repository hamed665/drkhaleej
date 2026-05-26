-- Phase 2.7B: media assets foundation only
DO $$
BEGIN
  CREATE TYPE media_asset_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'rejected',
    'hidden',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE media_asset_source AS ENUM (
    'uploaded',
    'external_url',
    'imported',
    'generated',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source media_asset_source NOT NULL DEFAULT 'uploaded',
  status media_asset_status NOT NULL DEFAULT 'draft',
  storage_bucket text NULL,
  storage_path text NULL,
  public_url text NULL,
  external_url text NULL,
  original_filename text NULL,
  mime_type text NULL,
  file_size_bytes bigint NULL,
  width integer NULL,
  height integer NULL,
  blurhash text NULL,
  checksum_sha256 text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_profile_id uuid NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT media_assets_location_presence_check CHECK (
    storage_path IS NOT NULL OR public_url IS NOT NULL OR external_url IS NOT NULL
  ),
  CONSTRAINT media_assets_storage_bucket_required_if_path_check CHECK (
    storage_path IS NULL OR storage_bucket IS NOT NULL
  ),
  CONSTRAINT media_assets_public_url_format_check CHECK (
    public_url IS NULL OR public_url ~* '^https?://.+'
  ),
  CONSTRAINT media_assets_external_url_format_check CHECK (
    external_url IS NULL OR external_url ~* '^https?://.+'
  ),
  CONSTRAINT media_assets_file_size_nonnegative_check CHECK (
    file_size_bytes IS NULL OR file_size_bytes >= 0
  ),
  CONSTRAINT media_assets_width_positive_check CHECK (
    width IS NULL OR width > 0
  ),
  CONSTRAINT media_assets_height_positive_check CHECK (
    height IS NULL OR height > 0
  )
);

CREATE INDEX IF NOT EXISTS media_assets_source_idx ON public.media_assets(source);
CREATE INDEX IF NOT EXISTS media_assets_status_idx ON public.media_assets(status);
CREATE INDEX IF NOT EXISTS media_assets_created_by_profile_id_idx ON public.media_assets(created_by_profile_id) WHERE created_by_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS media_assets_storage_bucket_storage_path_idx ON public.media_assets(storage_bucket, storage_path) WHERE storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS media_assets_public_url_idx ON public.media_assets(public_url) WHERE public_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS media_assets_external_url_idx ON public.media_assets(external_url) WHERE external_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS media_assets_deleted_at_idx ON public.media_assets(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS media_assets_storage_bucket_storage_path_unique_active_idx
  ON public.media_assets(storage_bucket, storage_path)
  WHERE storage_bucket IS NOT NULL AND storage_path IS NOT NULL AND deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_media_assets_updated_at'
  ) THEN
    CREATE TRIGGER set_media_assets_updated_at
    BEFORE UPDATE ON public.media_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
