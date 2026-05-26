ALTER TABLE public.patient_contacts
ADD COLUMN IF NOT EXISTS profile_id uuid NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'patient_contacts_profile_id_fkey'
  ) THEN
    ALTER TABLE public.patient_contacts
    ADD CONSTRAINT patient_contacts_profile_id_fkey
    FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS patient_contacts_profile_id_idx
ON public.patient_contacts(profile_id)
WHERE profile_id IS NOT NULL;
