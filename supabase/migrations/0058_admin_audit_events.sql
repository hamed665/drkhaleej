-- ADM-GOV-A: admin audit event foundation

CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_profile_id uuid REFERENCES public.profiles(id),
  actor_auth_user_id uuid,
  actor_email text,
  permission_key text,
  action text NOT NULL CHECK (btrim(action) <> ''),
  entity_type text NOT NULL CHECK (btrim(entity_type) <> ''),
  entity_id uuid,
  target_table text,
  summary text NOT NULL CHECK (btrim(summary) <> ''),
  reason text,
  old_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_source text NOT NULL DEFAULT 'admin' CHECK (btrim(request_source) <> '')
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created_at_desc
  ON public.admin_audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor_profile_id
  ON public.admin_audit_events(actor_profile_id) WHERE actor_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_permission_key
  ON public.admin_audit_events(permission_key) WHERE permission_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_entity_type_entity_id
  ON public.admin_audit_events(entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_action
  ON public.admin_audit_events(action);

ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;
