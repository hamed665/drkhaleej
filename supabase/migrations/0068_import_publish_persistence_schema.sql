-- IMPORT-PUBLISH-C: controlled publish persistence schema
-- Scope: protected audit, idempotency, and rollback storage for future single-entity publish execution.
-- Private by default: RLS is enabled and no anon/authenticated policies are added.

CREATE TABLE IF NOT EXISTS public.import_publish_idempotency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  entity_id uuid NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  expected_version text NOT NULL,
  request_hash text NOT NULL,
  status text NOT NULL DEFAULT 'reserved',
  terminal_result jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT import_publish_idempotency_key_check CHECK (char_length(btrim(idempotency_key)) BETWEEN 8 AND 240),
  CONSTRAINT import_publish_idempotency_expected_version_check CHECK (char_length(btrim(expected_version)) BETWEEN 1 AND 120),
  CONSTRAINT import_publish_idempotency_request_hash_check CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT import_publish_idempotency_status_check CHECK (status IN ('reserved','in_progress','succeeded','failed')),
  CONSTRAINT import_publish_idempotency_terminal_result_object_check CHECK (terminal_result IS NULL OR jsonb_typeof(terminal_result) = 'object'),
  CONSTRAINT import_publish_idempotency_expiry_check CHECK (expires_at > created_at AND expires_at <= created_at + interval '168 hours')
);

CREATE TABLE IF NOT EXISTS public.import_publish_rollback_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  idempotency_record_id uuid NOT NULL UNIQUE REFERENCES public.import_publish_idempotency_records(id) ON DELETE RESTRICT,
  expected_version text NOT NULL,
  snapshot_payload jsonb NOT NULL,
  snapshot_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  restored_at timestamptz NULL,
  restored_by_profile_id uuid NULL REFERENCES public.profiles(id),
  CONSTRAINT import_publish_rollback_expected_version_check CHECK (char_length(btrim(expected_version)) BETWEEN 1 AND 120),
  CONSTRAINT import_publish_rollback_payload_object_check CHECK (jsonb_typeof(snapshot_payload) = 'object'),
  CONSTRAINT import_publish_rollback_snapshot_hash_check CHECK (snapshot_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT import_publish_rollback_expiry_check CHECK (expires_at > created_at AND expires_at <= created_at + interval '365 days'),
  CONSTRAINT import_publish_rollback_restore_metadata_check CHECK (
    (restored_at IS NULL AND restored_by_profile_id IS NULL)
    OR (restored_at IS NOT NULL AND restored_by_profile_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.import_publish_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  idempotency_record_id uuid NOT NULL REFERENCES public.import_publish_idempotency_records(id) ON DELETE RESTRICT,
  rollback_snapshot_id uuid NULL REFERENCES public.import_publish_rollback_snapshots(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  outcome text NOT NULL,
  schema_version text NOT NULL,
  expected_version text NOT NULL,
  actual_version text NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_publish_audit_event_type_check CHECK (event_type IN (
    'dry_run_reviewed','execution_started','execution_succeeded','execution_failed',
    'rollback_started','rollback_succeeded','rollback_failed'
  )),
  CONSTRAINT import_publish_audit_outcome_check CHECK (outcome IN ('pending','succeeded','failed','rolled_back')),
  CONSTRAINT import_publish_audit_schema_version_check CHECK (char_length(btrim(schema_version)) BETWEEN 1 AND 64),
  CONSTRAINT import_publish_audit_expected_version_check CHECK (char_length(btrim(expected_version)) BETWEEN 1 AND 120),
  CONSTRAINT import_publish_audit_payload_object_check CHECK (jsonb_typeof(event_payload) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_import_publish_idempotency_entity_created
  ON public.import_publish_idempotency_records (entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_publish_idempotency_expires_at
  ON public.import_publish_idempotency_records (expires_at);
CREATE INDEX IF NOT EXISTS idx_import_publish_idempotency_status
  ON public.import_publish_idempotency_records (status);

CREATE INDEX IF NOT EXISTS idx_import_publish_rollback_entity_created
  ON public.import_publish_rollback_snapshots (entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_publish_rollback_expires_at
  ON public.import_publish_rollback_snapshots (expires_at);

CREATE INDEX IF NOT EXISTS idx_import_publish_audit_entity_created
  ON public.import_publish_audit_events (entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_publish_audit_idempotency_created
  ON public.import_publish_audit_events (idempotency_record_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_import_publish_audit_event_type
  ON public.import_publish_audit_events (event_type);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_import_publish_idempotency_set_updated_at') THEN
    CREATE TRIGGER trg_import_publish_idempotency_set_updated_at
      BEFORE UPDATE ON public.import_publish_idempotency_records
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.import_publish_idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_publish_rollback_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_publish_audit_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.import_publish_idempotency_records IS 'Private idempotency persistence for controlled single-entity publish execution.';
COMMENT ON TABLE public.import_publish_rollback_snapshots IS 'Private rollback snapshots captured before controlled publish mutation.';
COMMENT ON TABLE public.import_publish_audit_events IS 'Append-oriented private audit events for controlled publish and rollback attempts.';
