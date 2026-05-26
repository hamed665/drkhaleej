-- Phase 3.2B: patient + appointment private SELECT-only RLS policies

ALTER TABLE public.patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_cancellations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patient_contacts'
      AND policyname = 'patient_contacts_select_allowed'
  ) THEN
    CREATE POLICY patient_contacts_select_allowed
      ON public.patient_contacts
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_patient_contact(id) = true
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
      AND tablename = 'appointments'
      AND policyname = 'appointments_select_allowed'
  ) THEN
    CREATE POLICY appointments_select_allowed
      ON public.appointments
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_appointment(id) = true
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
      AND tablename = 'appointment_status_history'
      AND policyname = 'appointment_status_history_select_allowed'
  ) THEN
    CREATE POLICY appointment_status_history_select_allowed
      ON public.appointment_status_history
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_appointment(appointment_id) = true
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
      AND tablename = 'appointment_cancellations'
      AND policyname = 'appointment_cancellations_select_allowed'
  ) THEN
    CREATE POLICY appointment_cancellations_select_allowed
      ON public.appointment_cancellations
      FOR SELECT
      TO authenticated
      USING (
        public.can_view_appointment(appointment_id) = true
        AND deleted_at IS NULL
      );
  END IF;
END
$$;
