DO $$
BEGIN
  CREATE TYPE center_subscription_status AS ENUM ('pending', 'active', 'paused', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.center_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  subscription_plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status center_subscription_status NOT NULL DEFAULT 'pending',
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  trial_ends_at timestamptz NULL,
  billing_interval plan_interval NOT NULL DEFAULT 'monthly',
  agreed_price_amount numeric(12,3) NULL,
  currency_code text NOT NULL DEFAULT 'OMR',
  sales_profile_id uuid NULL REFERENCES public.profiles(id),
  notes text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT center_subscriptions_agreed_price_non_negative CHECK (agreed_price_amount IS NULL OR agreed_price_amount >= 0),
  CONSTRAINT center_subscriptions_currency_code_not_empty CHECK (btrim(currency_code) <> ''),
  CONSTRAINT center_subscriptions_ends_at_gte_starts_at CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at),
  CONSTRAINT center_subscriptions_trial_ends_at_gte_starts_at CHECK (trial_ends_at IS NULL OR starts_at IS NULL OR trial_ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS idx_center_subscriptions_center_id ON public.center_subscriptions(center_id);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_plan_id ON public.center_subscriptions(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_status ON public.center_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_billing_interval ON public.center_subscriptions(billing_interval);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_sales_profile_id ON public.center_subscriptions(sales_profile_id) WHERE sales_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_starts_at ON public.center_subscriptions(starts_at);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_ends_at ON public.center_subscriptions(ends_at);
CREATE INDEX IF NOT EXISTS idx_center_subscriptions_deleted_at ON public.center_subscriptions(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_center_subscriptions_one_active_like_per_center
ON public.center_subscriptions(center_id)
WHERE status IN ('pending', 'active', 'paused') AND deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_center_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER set_center_subscriptions_updated_at
    BEFORE UPDATE ON public.center_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
