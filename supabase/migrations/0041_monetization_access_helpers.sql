CREATE OR REPLACE FUNCTION public.can_view_center_subscription(target_center_subscription_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile uuid := public.current_profile_id();
BEGIN
  IF target_center_subscription_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  IF current_profile IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.center_subscriptions cs
    WHERE cs.id = target_center_subscription_id
      AND cs.deleted_at IS NULL
      AND cs.center_id IS NOT NULL
      AND public.can_manage_center(cs.center_id) = true
      AND public.can_view_center_private_data(cs.center_id) = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_sponsored_campaign(target_sponsored_campaign_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile uuid := public.current_profile_id();
BEGIN
  IF target_sponsored_campaign_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  IF current_profile IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.sponsored_campaigns sc
    WHERE sc.id = target_sponsored_campaign_id
      AND sc.deleted_at IS NULL
      AND (
        sc.created_by_profile_id = current_profile
        OR (
          sc.center_id IS NOT NULL
          AND public.can_manage_center(sc.center_id) = true
          AND public.can_view_center_private_data(sc.center_id) = true
        )
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_sponsored_placement_private(target_sponsored_placement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_sponsored_placement_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_platform_admin() = true THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.sponsored_placements sp
    WHERE sp.id = target_sponsored_placement_id
      AND sp.deleted_at IS NULL
      AND sp.campaign_id IS NOT NULL
      AND public.can_view_sponsored_campaign(sp.campaign_id) = true
  );
END;
$$;
