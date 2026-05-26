-- Phase 3.3A: review/report/media private read helper functions

CREATE OR REPLACE FUNCTION public.can_view_review_private(target_review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_profile_id uuid;
BEGIN
  IF target_review_id IS NULL THEN
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
    FROM public.reviews r
    WHERE r.id = target_review_id
      AND r.deleted_at IS NULL
      AND r.appointment_id IS NOT NULL
      AND public.can_view_appointment(r.appointment_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reviews r
    WHERE r.id = target_review_id
      AND r.deleted_at IS NULL
      AND r.patient_contact_id IS NOT NULL
      AND public.can_view_patient_contact(r.patient_contact_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reviews r
    WHERE r.id = target_review_id
      AND r.deleted_at IS NULL
      AND r.center_id IS NOT NULL
      AND public.can_view_center_private_data(r.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reviews r
    INNER JOIN public.center_services cs ON cs.id = r.center_service_id
    WHERE r.id = target_review_id
      AND r.deleted_at IS NULL
      AND r.center_service_id IS NOT NULL
      AND cs.deleted_at IS NULL
      AND public.can_view_center_private_data(cs.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reviews r
    INNER JOIN public.doctor_services ds ON ds.id = r.doctor_service_id
    WHERE r.id = target_review_id
      AND r.deleted_at IS NULL
      AND r.doctor_service_id IS NOT NULL
      AND ds.deleted_at IS NULL
      AND ds.center_id IS NOT NULL
      AND public.can_view_center_private_data(ds.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_review_report(target_review_report_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_profile_id uuid;
BEGIN
  IF target_review_report_id IS NULL THEN
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
    FROM public.review_reports rr
    WHERE rr.id = target_review_report_id
      AND rr.deleted_at IS NULL
      AND rr.reported_by_profile_id = requester_profile_id
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.review_reports rr
    WHERE rr.id = target_review_report_id
      AND rr.deleted_at IS NULL
      AND rr.reported_by_patient_contact_id IS NOT NULL
      AND public.can_view_patient_contact(rr.reported_by_patient_contact_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.review_reports rr
    WHERE rr.id = target_review_report_id
      AND rr.deleted_at IS NULL
      AND rr.review_id IS NOT NULL
      AND public.can_view_review_private(rr.review_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_media_asset_private(target_media_asset_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_profile_id uuid;
BEGIN
  IF target_media_asset_id IS NULL THEN
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
    FROM public.media_assets ma
    WHERE ma.id = target_media_asset_id
      AND ma.deleted_at IS NULL
      AND ma.created_by_profile_id = requester_profile_id
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    WHERE em.media_asset_id = target_media_asset_id
      AND em.deleted_at IS NULL
      AND em.entity_type = 'center'
      AND public.can_view_center_private_data(em.entity_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    INNER JOIN public.center_locations cl ON cl.id = em.entity_id
    WHERE em.media_asset_id = target_media_asset_id
      AND em.deleted_at IS NULL
      AND em.entity_type = 'center_location'
      AND cl.deleted_at IS NULL
      AND public.can_view_center_private_data(cl.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    INNER JOIN public.center_services cs ON cs.id = em.entity_id
    WHERE em.media_asset_id = target_media_asset_id
      AND em.deleted_at IS NULL
      AND em.entity_type = 'center_service'
      AND cs.deleted_at IS NULL
      AND public.can_view_center_private_data(cs.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    INNER JOIN public.doctor_services ds ON ds.id = em.entity_id
    WHERE em.media_asset_id = target_media_asset_id
      AND em.deleted_at IS NULL
      AND em.entity_type = 'doctor_service'
      AND ds.deleted_at IS NULL
      AND ds.center_id IS NOT NULL
      AND public.can_view_center_private_data(ds.center_id) = true
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    WHERE em.media_asset_id = target_media_asset_id
      AND em.deleted_at IS NULL
      AND em.entity_type = 'review'
      AND public.can_view_review_private(em.entity_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_entity_media_private(target_entity_media_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_entity_media_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.entity_media em
    WHERE em.id = target_entity_media_id
      AND em.deleted_at IS NULL
      AND public.can_view_media_asset_private(em.media_asset_id) = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
