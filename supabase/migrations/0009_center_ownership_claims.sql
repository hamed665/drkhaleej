DO $$
BEGIN
  CREATE TYPE center_member_role AS ENUM (
    'owner',
    'admin',
    'manager',
    'editor',
    'staff',
    'billing',
    'sales'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE center_membership_status AS ENUM (
    'invited',
    'pending',
    'active',
    'inactive',
    'suspended',
    'removed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.center_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  claimant_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  claim_status claim_status NOT NULL DEFAULT 'started',
  claimant_name text NULL,
  claimant_email text NULL,
  claimant_phone text NULL,
  claimant_position text NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_notes text NULL,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  approved_at timestamptz NULL,
  rejected_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT center_claims_claimant_email_format_check CHECK (
    claimant_email IS NULL OR claimant_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  )
);

CREATE INDEX IF NOT EXISTS idx_center_claims_center_id
  ON public.center_claims(center_id);

CREATE INDEX IF NOT EXISTS idx_center_claims_claimant_profile_id
  ON public.center_claims(claimant_profile_id);

CREATE INDEX IF NOT EXISTS idx_center_claims_claim_status
  ON public.center_claims(claim_status);

CREATE INDEX IF NOT EXISTS idx_center_claims_reviewed_by_profile_id
  ON public.center_claims(reviewed_by_profile_id)
  WHERE reviewed_by_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_center_claims_deleted_at
  ON public.center_claims(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_center_claims_active_claims
  ON public.center_claims(center_id, claimant_profile_id)
  WHERE deleted_at IS NULL
    AND claim_status IN ('started', 'submitted', 'under_review', 'approved');

CREATE TABLE IF NOT EXISTS public.center_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  role center_member_role NOT NULL DEFAULT 'staff',
  status center_membership_status NOT NULL DEFAULT 'pending',
  invited_by_profile_id uuid NULL REFERENCES public.profiles(id),
  approved_by_profile_id uuid NULL REFERENCES public.profiles(id),
  invite_email text NULL,
  invite_phone text NULL,
  invited_at timestamptz NULL,
  accepted_at timestamptz NULL,
  approved_at timestamptz NULL,
  suspended_at timestamptz NULL,
  removed_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT center_memberships_invite_email_format_check CHECK (
    invite_email IS NULL OR invite_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_center_memberships_center_profile_active
  ON public.center_memberships(center_id, profile_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_center_memberships_center_id
  ON public.center_memberships(center_id);

CREATE INDEX IF NOT EXISTS idx_center_memberships_profile_id
  ON public.center_memberships(profile_id);

CREATE INDEX IF NOT EXISTS idx_center_memberships_role
  ON public.center_memberships(role);

CREATE INDEX IF NOT EXISTS idx_center_memberships_status
  ON public.center_memberships(status);

CREATE INDEX IF NOT EXISTS idx_center_memberships_invited_by_profile_id
  ON public.center_memberships(invited_by_profile_id)
  WHERE invited_by_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_center_memberships_approved_by_profile_id
  ON public.center_memberships(approved_by_profile_id)
  WHERE approved_by_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_center_memberships_deleted_at
  ON public.center_memberships(deleted_at)
  WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_center_claims_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_center_claims_set_updated_at
      BEFORE UPDATE ON public.center_claims
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_center_memberships_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_center_memberships_set_updated_at
      BEFORE UPDATE ON public.center_memberships
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
