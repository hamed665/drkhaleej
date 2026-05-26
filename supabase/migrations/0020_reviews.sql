DO $$
BEGIN
  CREATE TYPE review_target_type AS ENUM ('center', 'doctor', 'service');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'hidden', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type review_target_type NOT NULL,
  center_id uuid NULL REFERENCES public.centers(id),
  doctor_id uuid NULL REFERENCES public.doctors(id),
  center_service_id uuid NULL REFERENCES public.center_services(id),
  doctor_service_id uuid NULL REFERENCES public.doctor_services(id),
  appointment_id uuid NULL REFERENCES public.appointments(id),
  patient_contact_id uuid NULL REFERENCES public.patient_contacts(id),
  rating smallint NOT NULL,
  title text NULL,
  body text NULL,
  status review_status NOT NULL DEFAULT 'pending',
  source_locale app_locale NOT NULL DEFAULT 'en',
  is_verified boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz NULL,
  rejected_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT reviews_target_presence_check CHECK (
    center_id IS NOT NULL
    OR doctor_id IS NOT NULL
    OR center_service_id IS NOT NULL
    OR doctor_service_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS reviews_target_type_idx ON public.reviews (target_type);
CREATE INDEX IF NOT EXISTS reviews_center_id_idx ON public.reviews (center_id) WHERE center_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_doctor_id_idx ON public.reviews (doctor_id) WHERE doctor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_center_service_id_idx ON public.reviews (center_service_id) WHERE center_service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_doctor_service_id_idx ON public.reviews (doctor_service_id) WHERE doctor_service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_appointment_id_idx ON public.reviews (appointment_id) WHERE appointment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_patient_contact_id_idx ON public.reviews (patient_contact_id) WHERE patient_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.reviews (status);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews (rating);
CREATE INDEX IF NOT EXISTS reviews_is_verified_idx ON public.reviews (is_verified);
CREATE INDEX IF NOT EXISTS reviews_submitted_at_idx ON public.reviews (submitted_at);
CREATE INDEX IF NOT EXISTS reviews_deleted_at_idx ON public.reviews (deleted_at) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_reviews_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_reviews_set_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
