-- Phase 3.5A: legal/consent/audit read access helpers (SELECT visibility only)

CREATE OR REPLACE FUNCTION public.can_view_consent_log(target_consent_log_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile uuid;
BEGIN
  IF target_consent_log_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() THEN
    RETURN true;
  END IF;

  current_profile := public.current_profile_id();

  RETURN EXISTS (
    SELECT 1
    FROM public.consent_logs cl
    WHERE cl.id = target_consent_log_id
      AND cl.deleted_at IS NULL
      AND (
        (current_profile IS NOT NULL AND cl.profile_id = current_profile)
        OR (
          cl.patient_contact_id IS NOT NULL
          AND public.can_view_patient_contact(cl.patient_contact_id)
        )
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_audit_log(target_audit_log_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_audit_log_id IS NULL THEN
    RETURN false;
  END IF;

  IF NOT public.is_platform_admin() THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.audit_logs al
    WHERE al.id = target_audit_log_id
      AND al.deleted_at IS NULL
  );
END;
$$;
