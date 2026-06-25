-- ADM-REL-A: import relation candidates foundation
-- Scope: protected admin-only relation staging. No public policies, public publishing, sitemap, crawler, or runtime profile activation.
-- Guardrails: doctor_practices_at_facility doctor_member_of_department facility_has_department department_service service_available_in_area.

CREATE TABLE IF NOT EXISTS public.import_relation_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  raw_row_id uuid NULL REFERENCES public.import_raw_rows(id) ON DELETE CASCADE,
  source_entity_candidate_id uuid NULL REFERENCES public.import_entity_candidates(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  relation_type text NOT NULL,
  source_entity_type text NOT NULL,
  source_entity_id uuid NULL,
  target_entity_type text NOT NULL,
  target_entity_id uuid NULL,
  candidate_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_score numeric(5,2) NOT NULL DEFAULT 0,
  match_reason text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'pending',
  resolved_by_profile_id uuid NULL REFERENCES public.profiles(id),
  resolved_at timestamptz NULL,
  review_note text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT import_relation_candidates_relation_type_check CHECK (relation_type IN (
    'doctor_practices_at_facility',
    'doctor_practices_at_location',
    'doctor_has_private_practice',
    'doctor_visits_facility',
    'doctor_member_of_department',
    'facility_has_department',
    'facility_offers_service',
    'facility_offers_specialty',
    'doctor_offers_service',
    'doctor_has_specialty',
    'facility_located_in_area',
    'facility_near_facility',
    'pharmacy_near_facility',
    'lab_near_facility',
    'area_contains_provider',
    'specialty_available_in_area',
    'service_available_in_area',
    'article_related_to_entity',
    'article_related_to_area',
    'unknown'
  )),
  CONSTRAINT import_relation_candidates_source_entity_type_check CHECK (source_entity_type IN (
    'doctor','center','hospital','pharmacy','clinic','laboratory','medical_center','facility_department','doctor_practice_location','center_location','center_service','department_service','geo_area','specialty','service','article','unknown'
  )),
  CONSTRAINT import_relation_candidates_target_entity_type_check CHECK (target_entity_type IN (
    'doctor','center','hospital','pharmacy','clinic','laboratory','medical_center','facility_department','doctor_practice_location','center_location','center_service','department_service','geo_area','specialty','service','article','unknown'
  )),
  CONSTRAINT import_relation_candidates_payload_object_check CHECK (jsonb_typeof(candidate_payload) = 'object'),
  CONSTRAINT import_relation_candidates_metadata_object_check CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT import_relation_candidates_match_score_check CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT import_relation_candidates_match_reason_check CHECK (char_length(btrim(match_reason)) BETWEEN 1 AND 1000),
  CONSTRAINT import_relation_candidates_resolution_status_check CHECK (resolution_status IN ('pending','approved','rejected','needs_manual_review','ignored')),
  CONSTRAINT import_relation_candidates_resolution_metadata_check CHECK (
    (resolution_status = 'pending' AND resolved_at IS NULL AND resolved_by_profile_id IS NULL)
    OR (resolution_status <> 'pending' AND resolved_at IS NOT NULL AND resolved_by_profile_id IS NOT NULL)
  ),
  CONSTRAINT import_relation_candidates_review_note_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_batch_id
  ON public.import_relation_candidates (batch_id);

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_raw_row_id
  ON public.import_relation_candidates (raw_row_id)
  WHERE raw_row_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_source_entity_candidate_id
  ON public.import_relation_candidates (source_entity_candidate_id)
  WHERE source_entity_candidate_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_relation_type
  ON public.import_relation_candidates (relation_type);

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_source_entity
  ON public.import_relation_candidates (source_entity_type, source_entity_id)
  WHERE source_entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_target_entity
  ON public.import_relation_candidates (target_entity_type, target_entity_id)
  WHERE target_entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_resolution_status
  ON public.import_relation_candidates (resolution_status);

CREATE INDEX IF NOT EXISTS idx_import_relation_candidates_created_at_desc
  ON public.import_relation_candidates (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_relation_candidates_set_updated_at') THEN
    CREATE TRIGGER trg_import_relation_candidates_set_updated_at
      BEFORE UPDATE ON public.import_relation_candidates
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.import_relation_candidates ENABLE ROW LEVEL SECURITY;
