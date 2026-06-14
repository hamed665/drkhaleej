-- DB-B: Provider onboarding lead events foundation.
-- Purpose: private/admin-only append-only companion history for provider onboarding leads.
-- Scope: additive schema only. RLS is enabled without access policies or grants.

CREATE TABLE IF NOT EXISTS public.provider_onboarding_lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.provider_onboarding_leads(id) ON DELETE CASCADE,
  actor_profile_id uuid NULL REFERENCES public.profiles(id),
  event_type text NOT NULL,
  old_status text NULL,
  new_status text NULL,
  old_priority text NULL,
  new_priority text NULL,
  note_text text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_onboarding_lead_events_event_type_check
    CHECK (event_type IN ('status_changed', 'priority_changed', 'note_added')),
  CONSTRAINT provider_onboarding_lead_events_old_status_check
    CHECK (old_status IS NULL OR old_status IN ('new', 'reviewing', 'contacted', 'qualified', 'rejected', 'converted', 'closed')),
  CONSTRAINT provider_onboarding_lead_events_new_status_check
    CHECK (new_status IS NULL OR new_status IN ('new', 'reviewing', 'contacted', 'qualified', 'rejected', 'converted', 'closed')),
  CONSTRAINT provider_onboarding_lead_events_old_priority_check
    CHECK (old_priority IS NULL OR old_priority IN ('low', 'normal', 'high')),
  CONSTRAINT provider_onboarding_lead_events_new_priority_check
    CHECK (new_priority IS NULL OR new_priority IN ('low', 'normal', 'high')),
  CONSTRAINT provider_onboarding_lead_events_note_text_check
    CHECK (
      note_text IS NULL
      OR (
        char_length(btrim(note_text)) BETWEEN 1 AND 1000
        AND note_text !~* '<[^>]+>'
      )
    ),
  CONSTRAINT provider_onboarding_lead_events_metadata_object_check
    CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT provider_onboarding_lead_events_shape_check
    CHECK (
      (
        event_type = 'status_changed'
        AND new_status IS NOT NULL
        AND old_priority IS NULL
        AND new_priority IS NULL
        AND note_text IS NULL
      )
      OR (
        event_type = 'priority_changed'
        AND new_priority IS NOT NULL
        AND old_status IS NULL
        AND new_status IS NULL
        AND note_text IS NULL
      )
      OR (
        event_type = 'note_added'
        AND note_text IS NOT NULL
        AND old_status IS NULL
        AND new_status IS NULL
        AND old_priority IS NULL
        AND new_priority IS NULL
      )
    )
);

COMMENT ON TABLE public.provider_onboarding_lead_events IS
  'Private/admin-only provider onboarding lead event history for future status_changed, priority_changed, and note_added events. RLS is enabled; no direct anon/authenticated access policies are added in this phase. Service-role server access must be guarded by platform-admin checks in application code.';

COMMENT ON COLUMN public.provider_onboarding_lead_events.lead_id IS
  'Provider onboarding lead whose private event history entry this row belongs to.';
COMMENT ON COLUMN public.provider_onboarding_lead_events.actor_profile_id IS
  'Nullable platform-admin profile actor for future server-side event writes.';
COMMENT ON COLUMN public.provider_onboarding_lead_events.event_type IS
  'Constrained event kind for the initial private lead history foundation: status_changed, priority_changed, or note_added.';
COMMENT ON COLUMN public.provider_onboarding_lead_events.note_text IS
  'Private admin note body for note_added events only; constrained to trimmed plain text between 1 and 1000 characters.';
COMMENT ON COLUMN public.provider_onboarding_lead_events.metadata IS
  'Private JSON object for future server-side event context; no public/client access is granted in this phase.';

CREATE INDEX IF NOT EXISTS provider_onboarding_lead_events_lead_id_created_at_idx
  ON public.provider_onboarding_lead_events(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS provider_onboarding_lead_events_actor_profile_id_idx
  ON public.provider_onboarding_lead_events(actor_profile_id)
  WHERE actor_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS provider_onboarding_lead_events_event_type_idx
  ON public.provider_onboarding_lead_events(event_type);

CREATE INDEX IF NOT EXISTS provider_onboarding_lead_events_created_at_idx
  ON public.provider_onboarding_lead_events(created_at DESC);

ALTER TABLE public.provider_onboarding_lead_events ENABLE ROW LEVEL SECURITY;
