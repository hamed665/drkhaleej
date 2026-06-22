-- ADM-CMS-A: admin CMS core and revision foundation
-- Scope: protected admin-only CMS entry and revision storage. No public policies or public rendering activation.

CREATE TABLE IF NOT EXISTS public.cms_content_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NULL REFERENCES public.profiles(id),
  updated_by_profile_id uuid NULL REFERENCES public.profiles(id),
  content_key text NOT NULL,
  content_type text NOT NULL,
  locale public.app_locale NULL,
  country public.country_code NOT NULL DEFAULT 'om',
  title_en text NULL,
  title_ar text NULL,
  slug text NULL,
  status text NOT NULL DEFAULT 'draft',
  current_revision_id uuid NULL,
  published_revision_id uuid NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_archived boolean NOT NULL DEFAULT false,
  deleted_at timestamptz NULL,
  CONSTRAINT cms_content_entries_content_key_check CHECK (char_length(btrim(content_key)) BETWEEN 1 AND 160),
  CONSTRAINT cms_content_entries_content_type_check CHECK (content_type IN ('homepage_section','about_page','for_providers_page','faq','article','seo_metadata','navigation_label','generic_page','offer_copy','landing_page')),
  CONSTRAINT cms_content_entries_status_check CHECK (status IN ('draft','in_review','approved','rejected','published','archived')),
  CONSTRAINT cms_content_entries_slug_length_check CHECK (slug IS NULL OR char_length(btrim(slug)) <= 160),
  CONSTRAINT cms_content_entries_title_en_length_check CHECK (title_en IS NULL OR char_length(btrim(title_en)) <= 220),
  CONSTRAINT cms_content_entries_title_ar_length_check CHECK (title_ar IS NULL OR char_length(btrim(title_ar)) <= 220),
  CONSTRAINT cms_content_entries_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT cms_content_entries_country_check CHECK (country = 'om')
);

CREATE TABLE IF NOT EXISTS public.cms_content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.cms_content_entries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NULL REFERENCES public.profiles(id),
  revision_number integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  title_en text NULL,
  title_ar text NULL,
  summary_en text NULL,
  summary_ar text NULL,
  body_en jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_ar jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title_en text NULL,
  seo_title_ar text NULL,
  seo_description_en text NULL,
  seo_description_ar text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_note text NULL,
  approved_at timestamptz NULL,
  approved_by_profile_id uuid NULL REFERENCES public.profiles(id),
  rejected_at timestamptz NULL,
  rejected_by_profile_id uuid NULL REFERENCES public.profiles(id),
  CONSTRAINT cms_content_revisions_revision_number_check CHECK (revision_number >= 1),
  CONSTRAINT cms_content_revisions_status_check CHECK (status IN ('draft','in_review','approved','rejected','published','archived')),
  CONSTRAINT cms_content_revisions_title_en_length_check CHECK (title_en IS NULL OR char_length(btrim(title_en)) <= 220),
  CONSTRAINT cms_content_revisions_title_ar_length_check CHECK (title_ar IS NULL OR char_length(btrim(title_ar)) <= 220),
  CONSTRAINT cms_content_revisions_summary_en_length_check CHECK (summary_en IS NULL OR char_length(btrim(summary_en)) <= 500),
  CONSTRAINT cms_content_revisions_summary_ar_length_check CHECK (summary_ar IS NULL OR char_length(btrim(summary_ar)) <= 500),
  CONSTRAINT cms_content_revisions_seo_title_en_length_check CHECK (seo_title_en IS NULL OR char_length(btrim(seo_title_en)) <= 70),
  CONSTRAINT cms_content_revisions_seo_title_ar_length_check CHECK (seo_title_ar IS NULL OR char_length(btrim(seo_title_ar)) <= 70),
  CONSTRAINT cms_content_revisions_seo_description_en_length_check CHECK (seo_description_en IS NULL OR char_length(btrim(seo_description_en)) <= 170),
  CONSTRAINT cms_content_revisions_seo_description_ar_length_check CHECK (seo_description_ar IS NULL OR char_length(btrim(seo_description_ar)) <= 170),
  CONSTRAINT cms_content_revisions_review_note_length_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000),
  CONSTRAINT cms_content_revisions_body_en_object_check CHECK (jsonb_typeof(body_en) = 'object'),
  CONSTRAINT cms_content_revisions_body_ar_object_check CHECK (jsonb_typeof(body_ar) = 'object'),
  CONSTRAINT cms_content_revisions_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT cms_content_revisions_approved_check CHECK (status <> 'approved' OR (approved_at IS NOT NULL AND approved_by_profile_id IS NOT NULL)),
  CONSTRAINT cms_content_revisions_rejected_check CHECK (status <> 'rejected' OR (rejected_at IS NOT NULL AND rejected_by_profile_id IS NOT NULL))
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cms_content_entries_current_revision_id_fkey' AND conrelid = 'public.cms_content_entries'::regclass) THEN
    ALTER TABLE public.cms_content_entries ADD CONSTRAINT cms_content_entries_current_revision_id_fkey FOREIGN KEY (current_revision_id) REFERENCES public.cms_content_revisions(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cms_content_entries_published_revision_id_fkey' AND conrelid = 'public.cms_content_entries'::regclass) THEN
    ALTER TABLE public.cms_content_entries ADD CONSTRAINT cms_content_entries_published_revision_id_fkey FOREIGN KEY (published_revision_id) REFERENCES public.cms_content_revisions(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS cms_content_entries_active_key_locale_country_idx
  ON public.cms_content_entries(content_key, COALESCE(locale::text, 'global'), country)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS cms_content_entries_created_at_desc_idx ON public.cms_content_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS cms_content_entries_content_type_idx ON public.cms_content_entries(content_type);
CREATE INDEX IF NOT EXISTS cms_content_entries_status_idx ON public.cms_content_entries(status);
CREATE INDEX IF NOT EXISTS cms_content_entries_content_key_idx ON public.cms_content_entries(content_key);
CREATE INDEX IF NOT EXISTS cms_content_entries_is_archived_idx ON public.cms_content_entries(is_archived);
CREATE UNIQUE INDEX IF NOT EXISTS cms_content_revisions_entry_revision_number_idx ON public.cms_content_revisions(entry_id, revision_number);
CREATE INDEX IF NOT EXISTS cms_content_revisions_entry_revision_desc_idx ON public.cms_content_revisions(entry_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS cms_content_revisions_status_idx ON public.cms_content_revisions(status);
CREATE INDEX IF NOT EXISTS cms_content_revisions_created_at_desc_idx ON public.cms_content_revisions(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_content_entries_set_updated_at') THEN
    CREATE TRIGGER trg_cms_content_entries_set_updated_at BEFORE UPDATE ON public.cms_content_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.cms_content_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_revisions ENABLE ROW LEVEL SECURITY;
