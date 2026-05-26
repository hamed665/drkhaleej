-- Phase 2.9A: Legal documents foundation

DO $$
BEGIN
  CREATE TYPE legal_document_status AS ENUM ('draft', 'active', 'archived', 'deprecated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type consent_type NOT NULL,
  version text NOT NULL CHECK (btrim(version) <> ''),
  title_en text NOT NULL CHECK (btrim(title_en) <> ''),
  title_ar text,
  body_en text NOT NULL CHECK (btrim(body_en) <> ''),
  body_ar text,
  status legal_document_status NOT NULL DEFAULT 'draft',
  effective_at timestamptz,
  published_at timestamptz,
  created_by_profile_id uuid REFERENCES public.profiles(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_legal_documents_document_type
  ON public.legal_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_legal_documents_status
  ON public.legal_documents(status);

CREATE INDEX IF NOT EXISTS idx_legal_documents_effective_at
  ON public.legal_documents(effective_at);

CREATE INDEX IF NOT EXISTS idx_legal_documents_published_at
  ON public.legal_documents(published_at);

CREATE INDEX IF NOT EXISTS idx_legal_documents_created_by_profile_id
  ON public.legal_documents(created_by_profile_id)
  WHERE created_by_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_legal_documents_deleted_at
  ON public.legal_documents(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_legal_documents_document_type_version_active
  ON public.legal_documents(document_type, version)
  WHERE deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_legal_documents_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_legal_documents_set_updated_at
      BEFORE UPDATE ON public.legal_documents
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
