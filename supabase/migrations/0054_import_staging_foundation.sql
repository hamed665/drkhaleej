-- Phase 5.4A: Import staging upload tables
-- Purpose: private admin-only staging storage for spreadsheet uploads.

CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name text NOT NULL,
  entity_type text NOT NULL,
  source_type text NOT NULL,
  source_name text NULL,
  file_name text NULL,
  file_hash text NULL,
  status text NOT NULL DEFAULT 'draft',
  total_rows integer NOT NULL DEFAULT 0,
  valid_rows integer NOT NULL DEFAULT 0,
  invalid_rows integer NOT NULL DEFAULT 0,
  duplicate_suspected_rows integer NOT NULL DEFAULT 0,
  ready_for_review_rows integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_batches_entity_type_check CHECK (entity_type IN ('doctor', 'hospital', 'pharmacy', 'clinic', 'laboratory', 'medical_center')),
  CONSTRAINT import_batches_source_type_check CHECK (source_type IN ('excel', 'csv', 'manual', 'api')),
  CONSTRAINT import_batches_status_check CHECK (status IN ('draft', 'uploaded', 'parsing', 'parsed', 'validation_failed', 'validated', 'normalizing', 'normalized', 'reviewing', 'ready_for_publish', 'completed', 'failed', 'archived')),
  CONSTRAINT import_batches_counts_check CHECK (total_rows >= 0 AND valid_rows >= 0 AND invalid_rows >= 0 AND duplicate_suspected_rows >= 0 AND ready_for_review_rows >= 0)
);

CREATE INDEX IF NOT EXISTS import_batches_status_idx ON public.import_batches(status);
CREATE INDEX IF NOT EXISTS import_batches_created_at_idx ON public.import_batches(created_at DESC);

CREATE TABLE IF NOT EXISTS public.import_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  uploaded_by_profile_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_hash text NOT NULL,
  template_key text NOT NULL,
  mime_type text NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'uploaded',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_files_template_key_check CHECK (template_key IN ('doctor_profile_v3', 'pharmacy_v1', 'hospital_v1')),
  CONSTRAINT import_files_status_check CHECK (status IN ('uploaded', 'parsed', 'failed', 'archived')),
  CONSTRAINT import_files_row_count_check CHECK (row_count >= 0)
);

CREATE INDEX IF NOT EXISTS import_files_batch_id_idx ON public.import_files(batch_id);
CREATE INDEX IF NOT EXISTS import_files_created_at_idx ON public.import_files(created_at DESC);

CREATE TABLE IF NOT EXISTS public.import_raw_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  import_file_id uuid NULL REFERENCES public.import_files(id) ON DELETE SET NULL,
  row_number integer NOT NULL,
  entity_type text NOT NULL,
  external_id text NULL,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  row_status text NOT NULL DEFAULT 'parsed',
  validation_score integer NOT NULL DEFAULT 0,
  source_url text NULL,
  last_checked_at date NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_raw_rows_entity_type_check CHECK (entity_type IN ('doctor', 'hospital', 'pharmacy', 'clinic', 'laboratory', 'medical_center')),
  CONSTRAINT import_raw_rows_row_status_check CHECK (row_status IN ('parsed', 'validation_failed', 'normalized', 'needs_review', 'duplicate_suspected', 'approved', 'rejected', 'published_noindex', 'index_eligible')),
  CONSTRAINT import_raw_rows_row_number_check CHECK (row_number > 0),
  CONSTRAINT import_raw_rows_validation_score_check CHECK (validation_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS import_raw_rows_batch_id_idx ON public.import_raw_rows(batch_id);
CREATE INDEX IF NOT EXISTS import_raw_rows_row_number_idx ON public.import_raw_rows(batch_id, row_number);

CREATE TABLE IF NOT EXISTS public.import_validation_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  severity text NOT NULL,
  field_name text NULL,
  issue_code text NOT NULL,
  issue_message text NOT NULL,
  suggested_fix text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_validation_issues_severity_check CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

CREATE INDEX IF NOT EXISTS import_validation_issues_batch_id_idx ON public.import_validation_issues(batch_id);
CREATE INDEX IF NOT EXISTS import_validation_issues_raw_row_id_idx ON public.import_validation_issues(raw_row_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_batches_set_updated_at') THEN
    CREATE TRIGGER trg_import_batches_set_updated_at BEFORE UPDATE ON public.import_batches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_files_set_updated_at') THEN
    CREATE TRIGGER trg_import_files_set_updated_at BEFORE UPDATE ON public.import_files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_raw_rows_set_updated_at') THEN
    CREATE TRIGGER trg_import_raw_rows_set_updated_at BEFORE UPDATE ON public.import_raw_rows FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
