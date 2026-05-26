-- Phase 3.1B: center access helper functions (read/access helpers only)

CREATE OR REPLACE FUNCTION public.is_active_center_member(target_center_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF target_center_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  v_profile_id := public.current_profile_id();
  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.center_memberships cm
    WHERE cm.center_id = target_center_id
      AND cm.profile_id = v_profile_id
      AND cm.status = 'active'
      AND cm.deleted_at IS NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_center(target_center_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF target_center_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  v_profile_id := public.current_profile_id();
  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.center_memberships cm
    WHERE cm.center_id = target_center_id
      AND cm.profile_id = v_profile_id
      AND cm.status = 'active'
      AND cm.deleted_at IS NULL
      AND cm.role IN ('owner', 'admin', 'manager')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_center_private_data(target_center_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  IF target_center_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  v_profile_id := public.current_profile_id();
  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.center_memberships cm
    WHERE cm.center_id = target_center_id
      AND cm.profile_id = v_profile_id
      AND cm.status = 'active'
      AND cm.deleted_at IS NULL
      AND cm.role IN ('owner', 'admin', 'manager', 'staff', 'billing', 'sales', 'editor')
  );
END;
$$;
