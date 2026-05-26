ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_placements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND policyname = 'subscription_plans_select_public_active'
  ) THEN
    CREATE POLICY subscription_plans_select_public_active
    ON public.subscription_plans
    FOR SELECT
    TO anon, authenticated
    USING (
      status = 'active'
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
      AND tablename = 'subscription_plans'
      AND policyname = 'subscription_plans_select_platform_admin'
  ) THEN
    CREATE POLICY subscription_plans_select_platform_admin
    ON public.subscription_plans
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
      AND tablename = 'center_subscriptions'
      AND policyname = 'center_subscriptions_select_allowed'
  ) THEN
    CREATE POLICY center_subscriptions_select_allowed
    ON public.center_subscriptions
    FOR SELECT
    TO authenticated
    USING (
      public.can_view_center_subscription(id) = true
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
      AND tablename = 'sponsored_campaigns'
      AND policyname = 'sponsored_campaigns_select_allowed'
  ) THEN
    CREATE POLICY sponsored_campaigns_select_allowed
    ON public.sponsored_campaigns
    FOR SELECT
    TO authenticated
    USING (
      public.can_view_sponsored_campaign(id) = true
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
      AND tablename = 'sponsored_placements'
      AND policyname = 'sponsored_placements_select_private_allowed'
  ) THEN
    CREATE POLICY sponsored_placements_select_private_allowed
    ON public.sponsored_placements
    FOR SELECT
    TO authenticated
    USING (
      public.can_view_sponsored_placement_private(id) = true
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
      AND tablename = 'sponsored_placements'
      AND policyname = 'sponsored_placements_select_public_active'
  ) THEN
    CREATE POLICY sponsored_placements_select_public_active
    ON public.sponsored_placements
    FOR SELECT
    TO anon, authenticated
    USING (
      is_active = true
      AND deleted_at IS NULL
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
      AND EXISTS (
        SELECT 1
        FROM public.sponsored_campaigns sc
        WHERE sc.id = sponsored_placements.campaign_id
          AND sc.status = 'active'
          AND sc.deleted_at IS NULL
          AND (sc.starts_at IS NULL OR sc.starts_at <= now())
          AND (sc.ends_at IS NULL OR sc.ends_at >= now())
      )
    );
  END IF;
END
$$;
