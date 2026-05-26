DO $$
BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'requested',
    'pending_confirmation',
    'confirmed',
    'rescheduled',
    'cancelled',
    'completed',
    'no_show',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_slot_id uuid NULL REFERENCES public.appointment_slots(id),
  patient_contact_id uuid NOT NULL REFERENCES public.patient_contacts(id),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id),
  doctor_practice_location_id uuid NULL REFERENCES public.doctor_practice_locations(id),
  center_id uuid NULL REFERENCES public.centers(id),
  center_location_id uuid NULL REFERENCES public.center_locations(id),
  doctor_service_id uuid NULL REFERENCES public.doctor_services(id),
  center_service_id uuid NULL REFERENCES public.center_services(id),
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Muscat',
  status appointment_status NOT NULL DEFAULT 'requested',
  patient_note text NULL,
  internal_note text NULL,
  cancellation_reason text NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  completed_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT appointments_time_window_check CHECK (end_time > start_time),
  CONSTRAINT appointments_timezone_not_empty_check CHECK (btrim(timezone) <> '')
);

CREATE INDEX IF NOT EXISTS appointments_appointment_slot_id_idx
  ON public.appointments (appointment_slot_id)
  WHERE appointment_slot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_patient_contact_id_idx
  ON public.appointments (patient_contact_id);

CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx
  ON public.appointments (doctor_id);

CREATE INDEX IF NOT EXISTS appointments_practice_location_id_idx
  ON public.appointments (doctor_practice_location_id)
  WHERE doctor_practice_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_center_id_idx
  ON public.appointments (center_id)
  WHERE center_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_center_location_id_idx
  ON public.appointments (center_location_id)
  WHERE center_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_doctor_service_id_idx
  ON public.appointments (doctor_service_id)
  WHERE doctor_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_center_service_id_idx
  ON public.appointments (center_service_id)
  WHERE center_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_slot_date_idx
  ON public.appointments (slot_date);

CREATE INDEX IF NOT EXISTS appointments_status_idx
  ON public.appointments (status);

CREATE INDEX IF NOT EXISTS appointments_deleted_at_idx
  ON public.appointments (deleted_at)
  WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_appointments_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_appointments_set_updated_at
      BEFORE UPDATE ON public.appointments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
