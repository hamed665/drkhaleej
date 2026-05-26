-- Phase 3.5A: legal/consent/audit SELECT-only RLS policies

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'legal_documents'
      AND policyname = 'legal_documents_select_public_active'
  ) THEN
    CREATE POLICY legal_documents_select_public_active
      ON public.legal_documents
      FOR SELECT
      TO anon, authenticated
      USING (
        status = 'active'
        AND deleted_at IS NULL
        AND (published_at IS NULL OR published_at <= now())
        AND (effective_at IS NULL OR effective_at <= now())
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'legal_documents'
      AND policyname = 'legal_documents_select_platform_admin'
  ) THEN
    CREATE POLICY legal_documents_select_platform_admin
      ON public.legal_documents
      FOR SELECT
      TO authenticated
      USING (
        public.is_platform_admin() = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consent_logs'
      AND policyname = 'consent_logs_select_allowed'
  ) THEN
    CREATE POLICY consent_logs_select_allowed
      ON public.consent_logs
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_consent_log(id) = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'audit_logs_select_platform_admin'
  ) THEN
    CREATE POLICY audit_logs_select_platform_admin
      ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_audit_log(id) = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;
