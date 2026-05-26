-- Phase 3.2B: patient + appointment private read helper functions

CREATE OR REPLACE FUNCTION public.can_view_patient_contact(target_patient_contact_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_profile_id uuid;
BEGIN
  IF target_patient_contact_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  requester_profile_id := public.current_profile_id();

  IF requester_profile_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.patient_contacts pc
    WHERE pc.id = target_patient_contact_id
      AND pc.profile_id = public.current_profile_id()
      AND pc.deleted_at IS NULL
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_contact_id = target_patient_contact_id
      AND a.deleted_at IS NULL
      AND a.center_id IS NOT NULL
      AND public.can_view_center_private_data(a.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_appointment(target_appointment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_profile_id uuid;
BEGIN
  IF target_appointment_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  requester_profile_id := public.current_profile_id();

  IF requester_profile_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    INNER JOIN public.patient_contacts pc
      ON pc.id = a.patient_contact_id
    WHERE a.id = target_appointment_id
      AND a.deleted_at IS NULL
      AND pc.profile_id = public.current_profile_id()
      AND pc.deleted_at IS NULL
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.id = target_appointment_id
      AND a.deleted_at IS NULL
      AND a.center_id IS NOT NULL
      AND public.can_view_center_private_data(a.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
