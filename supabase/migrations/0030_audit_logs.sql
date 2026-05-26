-- Phase 2.9A: Audit logs foundation

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type audit_actor_type NOT NULL DEFAULT 'system',
  actor_profile_id uuid REFERENCES public.profiles(id),
  action_type audit_action_type NOT NULL,
  entity_type text NOT NULL CHECK (btrim(entity_type) <> ''),
  entity_id uuid,
  request_id text,
  ip_hash text,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type
  ON public.audit_logs(actor_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_profile_id
  ON public.audit_logs(actor_profile_id)
  WHERE actor_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type
  ON public.audit_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type
  ON public.audit_logs(entity_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id
  ON public.audit_logs(entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id
  ON public.audit_logs(request_id)
  WHERE request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_deleted_at
  ON public.audit_logs(deleted_at)
  WHERE deleted_at IS NOT NULL;
