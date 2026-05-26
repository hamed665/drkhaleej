-- Phase 3.3A: reviews/reports/media private SELECT-only RLS policies

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_media ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'reviews_select_private_allowed'
  ) THEN
    CREATE POLICY reviews_select_private_allowed
      ON public.reviews
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_review_private(id) = true
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
      AND tablename = 'review_reports'
      AND policyname = 'review_reports_select_allowed'
  ) THEN
    CREATE POLICY review_reports_select_allowed
      ON public.review_reports
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_review_report(id) = true
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
      AND tablename = 'media_assets'
      AND policyname = 'media_assets_select_private_allowed'
  ) THEN
    CREATE POLICY media_assets_select_private_allowed
      ON public.media_assets
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_media_asset_private(id) = true
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
      AND tablename = 'entity_media'
      AND policyname = 'entity_media_select_private_allowed'
  ) THEN
    CREATE POLICY entity_media_select_private_allowed
      ON public.entity_media
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_entity_media_private(id) = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;
