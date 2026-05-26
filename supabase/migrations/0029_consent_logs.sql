-- Phase 2.9A: Consent logs foundation

CREATE TABLE IF NOT EXISTS public.consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_type consent_type NOT NULL,
  legal_document_id uuid REFERENCES public.legal_documents(id),
  profile_id uuid REFERENCES public.profiles(id),
  patient_contact_id uuid REFERENCES public.patient_contacts(id),
  anonymous_id text,
  locale app_locale NOT NULL DEFAULT 'en',
  country_code country_code NOT NULL DEFAULT 'om',
  consented boolean NOT NULL DEFAULT true,
  consented_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT consent_logs_identity_presence_check CHECK (
    profile_id IS NOT NULL OR patient_contact_id IS NOT NULL OR btrim(COALESCE(anonymous_id, '')) <> ''
  )
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_consent_type
  ON public.consent_logs(consent_type);

CREATE INDEX IF NOT EXISTS idx_consent_logs_legal_document_id
  ON public.consent_logs(legal_document_id)
  WHERE legal_document_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_logs_profile_id
  ON public.consent_logs(profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_logs_patient_contact_id
  ON public.consent_logs(patient_contact_id)
  WHERE patient_contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_logs_anonymous_id
  ON public.consent_logs(anonymous_id)
  WHERE anonymous_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_logs_consented_at
  ON public.consent_logs(consented_at);

CREATE INDEX IF NOT EXISTS idx_consent_logs_country_code
  ON public.consent_logs(country_code);

CREATE INDEX IF NOT EXISTS idx_consent_logs_deleted_at
  ON public.consent_logs(deleted_at)
  WHERE deleted_at IS NOT NULL;
