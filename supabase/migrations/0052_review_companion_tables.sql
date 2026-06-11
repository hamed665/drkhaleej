-- IMPLEMENT-REVIEW-COMPANION-TABLES-V1: Review companion tables migration.
-- Purpose: private companion foundation for future review moderation, disputes,
-- provider replies, fraud signals, eligibility, aggregates, audit, and policy versioning.
-- Scope: additive schema only. RLS is enabled without access policies or grants.

CREATE TABLE IF NOT EXISTS public.review_policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  policy_version text NOT NULL,
  effective_date date NULL,
  retired_at timestamptz NULL,
  applies_to text NULL,
  decision_context text NULL,
  public_visibility boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_policy_versions_name_version_unique
    UNIQUE (policy_name, policy_version),
  CONSTRAINT review_policy_versions_policy_name_check
    CHECK (btrim(policy_name) <> ''),
  CONSTRAINT review_policy_versions_policy_version_check
    CHECK (btrim(policy_version) <> '')
);

COMMENT ON TABLE public.review_policy_versions IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE TABLE IF NOT EXISTS public.review_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_status text NULL,
  to_status text NULL,
  moderator_profile_id uuid NULL REFERENCES public.profiles(id),
  moderator_role text NULL,
  reason_code text NULL,
  reason_note text NULL,
  medical_escalation_required boolean NOT NULL DEFAULT false,
  legal_privacy_escalation_required boolean NOT NULL DEFAULT false,
  fraud_escalation_required boolean NOT NULL DEFAULT false,
  redaction_required boolean NOT NULL DEFAULT false,
  public_visibility_changed boolean NOT NULL DEFAULT false,
  rating_eligibility_changed boolean NOT NULL DEFAULT false,
  schema_eligibility_changed boolean NOT NULL DEFAULT false,
  policy_version_id uuid NULL REFERENCES public.review_policy_versions(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_moderation_events_event_type_check
    CHECK (btrim(event_type) <> '')
);

COMMENT ON TABLE public.review_moderation_events IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE TABLE IF NOT EXISTS public.review_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  opened_by_profile_id uuid NULL REFERENCES public.profiles(id),
  opened_by_role text NULL,
  provider_id uuid NULL,
  dispute_reason text NOT NULL,
  evidence_summary text NULL,
  evidence_reference text NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_admin_profile_id uuid NULL REFERENCES public.profiles(id),
  legal_reviewer_profile_id uuid NULL REFERENCES public.profiles(id),
  medical_reviewer_profile_id uuid NULL REFERENCES public.profiles(id),
  resolution text NULL,
  resolved_by_profile_id uuid NULL REFERENCES public.profiles(id),
  resolved_at timestamptz NULL,
  temporary_visibility_action text NULL,
  rating_eligibility_action text NULL,
  notes_private text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_disputes_dispute_reason_check
    CHECK (btrim(dispute_reason) <> ''),
  CONSTRAINT review_disputes_status_check
    CHECK (btrim(status) <> '')
);

COMMENT ON TABLE public.review_disputes IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR. provider_id intentionally has no foreign key because the provider identity model may resolve to centers, doctors, or future ownership records.';

CREATE TABLE IF NOT EXISTS public.provider_review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  center_id uuid NULL REFERENCES public.centers(id),
  doctor_id uuid NULL REFERENCES public.doctors(id),
  reply_author_profile_id uuid NULL REFERENCES public.profiles(id),
  reply_body text NULL,
  status text NOT NULL DEFAULT 'draft',
  moderation_status text NOT NULL DEFAULT 'pending_moderation',
  submitted_at timestamptz NULL,
  approved_at timestamptz NULL,
  published_at timestamptz NULL,
  hidden_at timestamptz NULL,
  removed_at timestamptz NULL,
  moderated_by_profile_id uuid NULL REFERENCES public.profiles(id),
  rejection_reason text NULL,
  contains_private_data boolean NOT NULL DEFAULT false,
  contains_medical_advice boolean NOT NULL DEFAULT false,
  contains_abuse boolean NOT NULL DEFAULT false,
  public_visibility boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_review_replies_status_check
    CHECK (btrim(status) <> ''),
  CONSTRAINT provider_review_replies_moderation_status_check
    CHECK (btrim(moderation_status) <> '')
);

COMMENT ON TABLE public.provider_review_replies IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR. No center_id/doctor_id presence check is added yet because existing reviews may target center services or doctor services.';

CREATE TABLE IF NOT EXISTS public.review_fraud_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_score numeric(5,2) NULL,
  signal_source text NULL,
  signal_summary text NULL,
  privacy_sensitive boolean NOT NULL DEFAULT true,
  requires_human_review boolean NOT NULL DEFAULT true,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  reviewer_decision text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_fraud_signals_signal_type_check
    CHECK (btrim(signal_type) <> '')
);

COMMENT ON TABLE public.review_fraud_signals IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE TABLE IF NOT EXISTS public.review_eligibility_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  public_display_eligible boolean NOT NULL DEFAULT false,
  rating_average_eligible boolean NOT NULL DEFAULT false,
  review_schema_eligible boolean NOT NULL DEFAULT false,
  aggregate_rating_schema_eligible boolean NOT NULL DEFAULT false,
  reporting_eligible boolean NOT NULL DEFAULT false,
  eligibility_reason text NULL,
  policy_version_id uuid NULL REFERENCES public.review_policy_versions(id),
  calculated_at timestamptz NULL,
  calculated_by_profile_id uuid NULL REFERENCES public.profiles(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.review_eligibility_snapshots IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE TABLE IF NOT EXISTS public.review_aggregate_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  center_id uuid NULL REFERENCES public.centers(id),
  doctor_id uuid NULL REFERENCES public.doctors(id),
  center_service_id uuid NULL REFERENCES public.center_services(id),
  doctor_service_id uuid NULL REFERENCES public.doctor_services(id),
  eligible_review_count integer NOT NULL DEFAULT 0,
  average_overall_rating numeric(3,2) NULL,
  rating_scale integer NOT NULL DEFAULT 5,
  dimension_averages jsonb NULL,
  calculation_policy_version_id uuid NULL REFERENCES public.review_policy_versions(id),
  calculated_at timestamptz NULL,
  calculated_by_profile_id uuid NULL REFERENCES public.profiles(id),
  schema_eligible boolean NOT NULL DEFAULT false,
  public_display_eligible boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_aggregate_snapshots_target_type_check
    CHECK (btrim(target_type) <> ''),
  CONSTRAINT review_aggregate_snapshots_eligible_count_check
    CHECK (eligible_review_count >= 0),
  CONSTRAINT review_aggregate_snapshots_rating_scale_check
    CHECK (rating_scale > 0),
  CONSTRAINT review_aggregate_snapshots_average_rating_check
    CHECK (
      average_overall_rating IS NULL
      OR (average_overall_rating >= 1 AND average_overall_rating <= rating_scale)
    )
);

COMMENT ON TABLE public.review_aggregate_snapshots IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE TABLE IF NOT EXISTS public.review_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NULL,
  actor_profile_id uuid NULL REFERENCES public.profiles(id),
  actor_role text NULL,
  action text NOT NULL,
  before_value_summary text NULL,
  after_value_summary text NULL,
  reason_code text NULL,
  reason_note text NULL,
  ip_or_device_context_later_if_policy_approved text NULL,
  privacy_sensitive boolean NOT NULL DEFAULT true,
  policy_version_id uuid NULL REFERENCES public.review_policy_versions(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_audit_events_entity_type_check
    CHECK (btrim(entity_type) <> ''),
  CONSTRAINT review_audit_events_action_check
    CHECK (btrim(action) <> '')
);

COMMENT ON TABLE public.review_audit_events IS
  'Private review companion foundation table. RLS is enabled with no policies in this phase; access policies are deferred to a future dedicated RLS PR.';

CREATE INDEX IF NOT EXISTS review_moderation_events_review_id_idx
  ON public.review_moderation_events(review_id);

CREATE INDEX IF NOT EXISTS review_moderation_events_event_type_idx
  ON public.review_moderation_events(event_type);

CREATE INDEX IF NOT EXISTS review_disputes_review_id_status_idx
  ON public.review_disputes(review_id, status);

CREATE INDEX IF NOT EXISTS review_disputes_provider_id_status_idx
  ON public.review_disputes(provider_id, status)
  WHERE provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS provider_review_replies_review_id_status_idx
  ON public.provider_review_replies(review_id, status);

CREATE INDEX IF NOT EXISTS provider_review_replies_center_id_status_idx
  ON public.provider_review_replies(center_id, status)
  WHERE center_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS provider_review_replies_doctor_id_status_idx
  ON public.provider_review_replies(doctor_id, status)
  WHERE doctor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS review_fraud_signals_review_id_signal_type_idx
  ON public.review_fraud_signals(review_id, signal_type);

CREATE INDEX IF NOT EXISTS review_eligibility_snapshots_review_id_idx
  ON public.review_eligibility_snapshots(review_id);

CREATE INDEX IF NOT EXISTS review_aggregate_snapshots_target_type_idx
  ON public.review_aggregate_snapshots(target_type);

CREATE INDEX IF NOT EXISTS review_aggregate_snapshots_center_id_idx
  ON public.review_aggregate_snapshots(center_id)
  WHERE center_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS review_aggregate_snapshots_doctor_id_idx
  ON public.review_aggregate_snapshots(doctor_id)
  WHERE doctor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS review_audit_events_entity_idx
  ON public.review_audit_events(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS review_audit_events_actor_profile_id_idx
  ON public.review_audit_events(actor_profile_id)
  WHERE actor_profile_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_review_policy_versions_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_review_policy_versions_set_updated_at
      BEFORE UPDATE ON public.review_policy_versions
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_review_disputes_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_review_disputes_set_updated_at
      BEFORE UPDATE ON public.review_disputes
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_provider_review_replies_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_provider_review_replies_set_updated_at
      BEFORE UPDATE ON public.provider_review_replies
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_review_fraud_signals_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_review_fraud_signals_set_updated_at
      BEFORE UPDATE ON public.review_fraud_signals
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.review_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_eligibility_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_aggregate_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_audit_events ENABLE ROW LEVEL SECURITY;
