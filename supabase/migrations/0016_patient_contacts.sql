DO $$
BEGIN
  CREATE TYPE patient_contact_gender AS ENUM ('male', 'female', 'other', 'unspecified');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.patient_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NULL,
  gender patient_contact_gender NOT NULL DEFAULT 'unspecified',
  birth_year integer NULL,
  preferred_locale app_locale NOT NULL DEFAULT 'en',
  country_code country_code NOT NULL DEFAULT 'om',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT patient_contacts_full_name_not_empty_check CHECK (btrim(full_name) <> ''),
  CONSTRAINT patient_contacts_phone_not_empty_check CHECK (btrim(phone) <> ''),
  CONSTRAINT patient_contacts_email_format_check CHECK (
    email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  CONSTRAINT patient_contacts_birth_year_check CHECK (
    birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)
  )
);

CREATE INDEX IF NOT EXISTS patient_contacts_phone_idx
  ON public.patient_contacts (phone);

CREATE INDEX IF NOT EXISTS patient_contacts_email_idx
  ON public.patient_contacts (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS patient_contacts_country_code_idx
  ON public.patient_contacts (country_code);

CREATE INDEX IF NOT EXISTS patient_contacts_deleted_at_idx
  ON public.patient_contacts (deleted_at)
  WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_patient_contacts_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_patient_contacts_set_updated_at
      BEFORE UPDATE ON public.patient_contacts
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;
