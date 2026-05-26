-- Phase 2.6A: Appointment Slots Foundation
-- Scope: appointment slot inventory only (no booking/patient/payment/RLS/seed artifacts)

DO $$
BEGIN
  CREATE TYPE appointment_slot_status AS ENUM (
    'draft',
    'available',
    'held',
    'booked',
    'blocked',
    'cancelled',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id),
  doctor_practice_location_id uuid NULL REFERENCES public.doctor_practice_locations(id),
  doctor_schedule_id uuid NULL REFERENCES public.doctor_schedules(id),
  doctor_schedule_exception_id uuid NULL REFERENCES public.doctor_schedule_exceptions(id),
  center_id uuid NULL REFERENCES public.centers(id),
  center_location_id uuid NULL REFERENCES public.center_locations(id),
  doctor_service_id uuid NULL REFERENCES public.doctor_services(id),
  center_service_id uuid NULL REFERENCES public.center_services(id),
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Muscat',
  status appointment_slot_status NOT NULL DEFAULT 'draft',
  is_online boolean NOT NULL DEFAULT false,
  is_walk_in boolean NOT NULL DEFAULT false,
  capacity integer NOT NULL DEFAULT 1,
  booked_count integer NOT NULL DEFAULT 0,
  hold_expires_at timestamptz NULL,
  notes_en text NULL,
  notes_ar text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,

  CONSTRAINT appointment_slots_time_window_check CHECK (end_time > start_time),
  CONSTRAINT appointment_slots_capacity_check CHECK (capacity >= 1),
  CONSTRAINT appointment_slots_booked_count_nonnegative_check CHECK (booked_count >= 0),
  CONSTRAINT appointment_slots_booked_count_capacity_check CHECK (booked_count <= capacity),
  CONSTRAINT appointment_slots_timezone_not_empty_check CHECK (btrim(timezone) <> '')
);

CREATE INDEX IF NOT EXISTS appointment_slots_doctor_id_idx
  ON public.appointment_slots (doctor_id);

CREATE INDEX IF NOT EXISTS appointment_slots_practice_location_id_idx
  ON public.appointment_slots (doctor_practice_location_id)
  WHERE doctor_practice_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_schedule_id_idx
  ON public.appointment_slots (doctor_schedule_id)
  WHERE doctor_schedule_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_schedule_exception_id_idx
  ON public.appointment_slots (doctor_schedule_exception_id)
  WHERE doctor_schedule_exception_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_center_id_idx
  ON public.appointment_slots (center_id)
  WHERE center_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_center_location_id_idx
  ON public.appointment_slots (center_location_id)
  WHERE center_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_doctor_service_id_idx
  ON public.appointment_slots (doctor_service_id)
  WHERE doctor_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_center_service_id_idx
  ON public.appointment_slots (center_service_id)
  WHERE center_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointment_slots_slot_date_idx
  ON public.appointment_slots (slot_date);

CREATE INDEX IF NOT EXISTS appointment_slots_status_idx
  ON public.appointment_slots (status);

CREATE INDEX IF NOT EXISTS appointment_slots_deleted_at_idx
  ON public.appointment_slots (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS appointment_slots_doctor_location_time_unique_idx
  ON public.appointment_slots (doctor_id, doctor_practice_location_id, slot_date, start_time, end_time)
  WHERE doctor_practice_location_id IS NOT NULL
    AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS appointment_slots_doctor_time_no_location_unique_idx
  ON public.appointment_slots (doctor_id, slot_date, start_time, end_time)
  WHERE doctor_practice_location_id IS NULL
    AND deleted_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_appointment_slots_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_appointment_slots_set_updated_at
      BEFORE UPDATE ON public.appointment_slots
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
