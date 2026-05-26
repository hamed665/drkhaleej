-- Phase 3.1B: center memberships/claims SELECT-only RLS policies

ALTER TABLE public.center_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_claims ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'center_memberships'
      AND policyname = 'center_memberships_select_own'
  ) THEN
    CREATE POLICY center_memberships_select_own
      ON public.center_memberships
      FOR SELECT
      TO authenticated
      USING (
        profile_id = public.current_profile_id()
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
      AND tablename = 'center_memberships'
      AND policyname = 'center_memberships_select_platform_admin'
  ) THEN
    CREATE POLICY center_memberships_select_platform_admin
      ON public.center_memberships
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
      AND tablename = 'center_memberships'
      AND policyname = 'center_memberships_select_center_managers'
  ) THEN
    CREATE POLICY center_memberships_select_center_managers
      ON public.center_memberships
      FOR SELECT
      TO authenticated
      USING (
        public.can_manage_center(center_id) = true
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
      AND tablename = 'center_claims'
      AND policyname = 'center_claims_select_own'
  ) THEN
    CREATE POLICY center_claims_select_own
      ON public.center_claims
      FOR SELECT
      TO authenticated
      USING (
        claimant_profile_id = public.current_profile_id()
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
      AND tablename = 'center_claims'
      AND policyname = 'center_claims_select_platform_admin'
  ) THEN
    CREATE POLICY center_claims_select_platform_admin
      ON public.center_claims
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
      AND tablename = 'center_claims'
      AND policyname = 'center_claims_select_center_managers'
  ) THEN
    CREATE POLICY center_claims_select_center_managers
      ON public.center_claims
      FOR SELECT
      TO authenticated
      USING (
        public.can_manage_center(center_id) = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;
