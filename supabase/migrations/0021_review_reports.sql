DO $$
BEGIN
  CREATE TYPE review_report_reason AS ENUM ('spam', 'offensive', 'fake', 'irrelevant', 'privacy', 'medical_claim', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE review_report_status AS ENUM ('open', 'under_review', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id),
  reported_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reported_by_patient_contact_id uuid NULL REFERENCES public.patient_contacts(id),
  reason review_report_reason NOT NULL DEFAULT 'other',
  status review_report_status NOT NULL DEFAULT 'open',
  note text NULL,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  resolved_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS review_reports_review_id_idx ON public.review_reports (review_id);
CREATE INDEX IF NOT EXISTS review_reports_reported_by_profile_id_idx ON public.review_reports (reported_by_profile_id) WHERE reported_by_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_reports_reported_by_patient_contact_id_idx ON public.review_reports (reported_by_patient_contact_id) WHERE reported_by_patient_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_reports_reason_idx ON public.review_reports (reason);
CREATE INDEX IF NOT EXISTS review_reports_status_idx ON public.review_reports (status);
CREATE INDEX IF NOT EXISTS review_reports_reviewed_by_profile_id_idx ON public.review_reports (reviewed_by_profile_id) WHERE reviewed_by_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS review_reports_created_at_idx ON public.review_reports (created_at);
CREATE INDEX IF NOT EXISTS review_reports_deleted_at_idx ON public.review_reports (deleted_at) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_review_reports_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_review_reports_set_updated_at
    BEFORE UPDATE ON public.review_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
