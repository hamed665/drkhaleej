-- ADM-IMPORT-A: unified import staging foundation
-- Scope: protected admin-only import staging and review structures. No public policies, public publishing, sitemap, crawler, or runtime profile activation.

CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_profile_id uuid NULL REFERENCES public.profiles(id),
  batch_name text NOT NULL,
  entity_type text NOT NULL,
  source_type text NOT NULL DEFAULT 'excel',
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
  deleted_at timestamptz NULL,
  CONSTRAINT import_batches_batch_name_check CHECK (char_length(btrim(batch_name)) BETWEEN 1 AND 180),
  CONSTRAINT import_batches_entity_type_check CHECK (entity_type IN ('doctor','hospital','pharmacy','clinic','laboratory','medical_center')),
  CONSTRAINT import_batches_source_type_check CHECK (source_type IN ('excel','csv','manual','api','other')),
  CONSTRAINT import_batches_status_check CHECK (status IN ('draft','uploaded','parsing','parsed','validation_failed','validated','normalizing','normalized','reviewing','ready_for_publish','completed','failed','archived')),
  CONSTRAINT import_batches_row_counts_check CHECK (total_rows >= 0 AND valid_rows >= 0 AND invalid_rows >= 0 AND duplicate_suspected_rows >= 0 AND ready_for_review_rows >= 0),
  CONSTRAINT import_batches_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_profile_id uuid NULL REFERENCES public.profiles(id),
  file_name text NOT NULL,
  file_hash text NOT NULL,
  template_key text NOT NULL,
  mime_type text NULL,
  storage_path text NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'registered',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at timestamptz NULL,
  CONSTRAINT import_files_file_name_check CHECK (char_length(btrim(file_name)) BETWEEN 1 AND 260),
  CONSTRAINT import_files_file_hash_check CHECK (char_length(btrim(file_hash)) BETWEEN 12 AND 160),
  CONSTRAINT import_files_template_key_check CHECK (template_key IN ('doctor_profile_v3','pharmacy_v1','hospital_v1','generic_provider_v1')),
  CONSTRAINT import_files_status_check CHECK (status IN ('registered','parsed','rejected','archived')),
  CONSTRAINT import_files_row_count_check CHECK (row_count >= 0),
  CONSTRAINT import_files_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_raw_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  import_file_id uuid NULL REFERENCES public.import_files(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  row_number integer NOT NULL,
  entity_type text NOT NULL,
  external_id text NULL,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  row_status text NOT NULL DEFAULT 'raw',
  validation_score integer NOT NULL DEFAULT 0,
  source_url text NULL,
  last_checked_at date NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_raw_rows_row_number_check CHECK (row_number >= 1),
  CONSTRAINT import_raw_rows_entity_type_check CHECK (entity_type IN ('doctor','hospital','pharmacy','clinic','laboratory','medical_center')),
  CONSTRAINT import_raw_rows_external_id_check CHECK (external_id IS NULL OR char_length(btrim(external_id)) <= 180),
  CONSTRAINT import_raw_rows_status_check CHECK (row_status IN ('raw','parsed','validation_failed','normalized','duplicate_suspected','needs_review','ready_for_publish','published_noindex','index_eligible','rejected')),
  CONSTRAINT import_raw_rows_validation_score_check CHECK (validation_score BETWEEN 0 AND 100),
  CONSTRAINT import_raw_rows_raw_payload_object_check CHECK (jsonb_typeof(raw_payload) = 'object'),
  CONSTRAINT import_raw_rows_normalized_payload_object_check CHECK (jsonb_typeof(normalized_payload) = 'object'),
  CONSTRAINT import_raw_rows_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_validation_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL,
  field_name text NULL,
  issue_code text NOT NULL,
  issue_message text NOT NULL,
  suggested_fix text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_validation_issues_severity_check CHECK (severity IN ('info','warning','error','critical')),
  CONSTRAINT import_validation_issues_field_name_check CHECK (field_name IS NULL OR char_length(btrim(field_name)) <= 160),
  CONSTRAINT import_validation_issues_issue_code_check CHECK (char_length(btrim(issue_code)) BETWEEN 1 AND 120),
  CONSTRAINT import_validation_issues_issue_message_check CHECK (char_length(btrim(issue_message)) BETWEEN 1 AND 1000),
  CONSTRAINT import_validation_issues_suggested_fix_check CHECK (suggested_fix IS NULL OR char_length(btrim(suggested_fix)) <= 1000),
  CONSTRAINT import_validation_issues_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_entity_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NOT NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  entity_type text NOT NULL,
  candidate_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  candidate_status text NOT NULL DEFAULT 'draft',
  quality_score integer NOT NULL DEFAULT 0,
  review_note text NULL,
  CONSTRAINT import_entity_candidates_entity_type_check CHECK (entity_type IN ('doctor','hospital','pharmacy','clinic','laboratory','medical_center')),
  CONSTRAINT import_entity_candidates_status_check CHECK (candidate_status IN ('draft','needs_review','approved','rejected','blocked')),
  CONSTRAINT import_entity_candidates_quality_score_check CHECK (quality_score BETWEEN 0 AND 100),
  CONSTRAINT import_entity_candidates_payload_object_check CHECK (jsonb_typeof(candidate_payload) = 'object'),
  CONSTRAINT import_entity_candidates_review_note_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000)
);

CREATE TABLE IF NOT EXISTS public.import_duplicate_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NOT NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  matched_entity_type text NOT NULL,
  matched_entity_id uuid NULL,
  match_score numeric(5,2) NOT NULL DEFAULT 0,
  match_reason text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'pending',
  resolved_by_profile_id uuid NULL REFERENCES public.profiles(id),
  resolved_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_duplicate_candidates_matched_entity_type_check CHECK (matched_entity_type IN ('doctor','center','hospital','pharmacy','clinic','laboratory','medical_center','unknown')),
  CONSTRAINT import_duplicate_candidates_match_score_check CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT import_duplicate_candidates_match_reason_check CHECK (char_length(btrim(match_reason)) BETWEEN 1 AND 1000),
  CONSTRAINT import_duplicate_candidates_resolution_status_check CHECK (resolution_status IN ('pending','same_entity','different_entity','needs_manual_review','ignored')),
  CONSTRAINT import_duplicate_candidates_resolution_check CHECK ((resolution_status = 'pending' AND resolved_at IS NULL) OR (resolution_status <> 'pending')),
  CONSTRAINT import_duplicate_candidates_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_mapping_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NOT NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  mapping_type text NOT NULL,
  source_value text NULL,
  target_type text NOT NULL,
  target_id uuid NULL,
  target_slug text NULL,
  confidence_score numeric(5,2) NOT NULL DEFAULT 0,
  mapping_status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_mapping_results_mapping_type_check CHECK (mapping_type IN ('taxonomy','geo','license','contact','media','service','specialty','language','insurance','unknown')),
  CONSTRAINT import_mapping_results_target_type_check CHECK (target_type IN ('doctor','center','location','service','specialty','license','media','contact','geo_area','unknown')),
  CONSTRAINT import_mapping_results_confidence_score_check CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CONSTRAINT import_mapping_results_mapping_status_check CHECK (mapping_status IN ('pending','matched','needs_review','rejected')),
  CONSTRAINT import_mapping_results_source_value_check CHECK (source_value IS NULL OR char_length(btrim(source_value)) <= 500),
  CONSTRAINT import_mapping_results_target_slug_check CHECK (target_slug IS NULL OR char_length(btrim(target_slug)) <= 180),
  CONSTRAINT import_mapping_results_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE IF NOT EXISTS public.import_publish_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NOT NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  target_entity_type text NOT NULL,
  target_entity_id uuid NULL,
  publish_status text NOT NULL DEFAULT 'not_ready',
  index_policy text NOT NULL DEFAULT 'noindex',
  sitemap_policy text NOT NULL DEFAULT 'excluded',
  quality_score integer NOT NULL DEFAULT 0,
  admin_note text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_publish_queue_target_entity_type_check CHECK (target_entity_type IN ('doctor','center','hospital','pharmacy','clinic','laboratory','medical_center')),
  CONSTRAINT import_publish_queue_publish_status_check CHECK (publish_status IN ('not_ready','queued','published_noindex','index_eligible','blocked','rejected')),
  CONSTRAINT import_publish_queue_index_policy_check CHECK (index_policy IN ('noindex','index_eligible','blocked')),
  CONSTRAINT import_publish_queue_sitemap_policy_check CHECK (sitemap_policy IN ('excluded','eligible','included','blocked')),
  CONSTRAINT import_publish_queue_quality_score_check CHECK (quality_score BETWEEN 0 AND 100),
  CONSTRAINT import_publish_queue_admin_note_check CHECK (admin_note IS NULL OR char_length(btrim(admin_note)) <= 1000),
  CONSTRAINT import_publish_queue_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_import_batches_created_at_desc ON public.import_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON public.import_batches(status);
CREATE INDEX IF NOT EXISTS idx_import_batches_entity_type ON public.import_batches(entity_type);
CREATE INDEX IF NOT EXISTS idx_import_files_batch_id ON public.import_files(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_raw_rows_batch_id ON public.import_raw_rows(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_raw_rows_status ON public.import_raw_rows(row_status);
CREATE INDEX IF NOT EXISTS idx_import_raw_rows_external_id ON public.import_raw_rows(external_id);
CREATE INDEX IF NOT EXISTS idx_import_validation_issues_batch_id ON public.import_validation_issues(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_validation_issues_raw_row_id ON public.import_validation_issues(raw_row_id);
CREATE INDEX IF NOT EXISTS idx_import_validation_issues_severity ON public.import_validation_issues(severity);
CREATE INDEX IF NOT EXISTS idx_import_entity_candidates_batch_id ON public.import_entity_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_entity_candidates_raw_row_id ON public.import_entity_candidates(raw_row_id);
CREATE INDEX IF NOT EXISTS idx_import_duplicate_candidates_batch_id ON public.import_duplicate_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_duplicate_candidates_raw_row_id ON public.import_duplicate_candidates(raw_row_id);
CREATE INDEX IF NOT EXISTS idx_import_duplicate_candidates_resolution_status ON public.import_duplicate_candidates(resolution_status);
CREATE INDEX IF NOT EXISTS idx_import_mapping_results_batch_id ON public.import_mapping_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_mapping_results_raw_row_id ON public.import_mapping_results(raw_row_id);
CREATE INDEX IF NOT EXISTS idx_import_publish_queue_batch_id ON public.import_publish_queue(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_publish_queue_raw_row_id ON public.import_publish_queue(raw_row_id);
CREATE INDEX IF NOT EXISTS idx_import_publish_queue_publish_status ON public.import_publish_queue(publish_status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_batches_set_updated_at') THEN
    CREATE TRIGGER trg_import_batches_set_updated_at BEFORE UPDATE ON public.import_batches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_raw_rows_set_updated_at') THEN
    CREATE TRIGGER trg_import_raw_rows_set_updated_at BEFORE UPDATE ON public.import_raw_rows FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_entity_candidates_set_updated_at') THEN
    CREATE TRIGGER trg_import_entity_candidates_set_updated_at BEFORE UPDATE ON public.import_entity_candidates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_publish_queue_set_updated_at') THEN
    CREATE TRIGGER trg_import_publish_queue_set_updated_at BEFORE UPDATE ON public.import_publish_queue FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_raw_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_validation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_entity_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_mapping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_publish_queue ENABLE ROW LEVEL SECURITY;
