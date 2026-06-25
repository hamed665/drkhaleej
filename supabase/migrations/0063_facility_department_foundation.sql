-- REL-DEPT-A: facility department foundation
-- Purpose: add reviewed facility department relations without public exposure.

CREATE TABLE IF NOT EXISTS public.facility_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id),
  center_location_id uuid NULL REFERENCES public.center_locations(id),
  slug text NOT NULL,
  name_en text NOT NULL,
  name_ar text NULL,
  description_en text NULL,
  description_ar text NULL,
  department_kind text NOT NULL DEFAULT 'clinical',
  department_review_status text NOT NULL DEFAULT 'draft',
  public_department_visible boolean NOT NULL DEFAULT false,
  source_url text NULL,
  source_name text NULL,
  source_type text NULL,
  last_checked_at timestamptz NULL,
  confidence_score numeric(5,2) NULL,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  review_note text NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT facility_departments_slug_not_empty CHECK (btrim(slug) <> ''),
  CONSTRAINT facility_departments_name_en_not_empty CHECK (btrim(name_en) <> ''),
  CONSTRAINT facility_departments_department_kind_check CHECK (department_kind IN ('clinical', 'diagnostic', 'emergency', 'support', 'administrative', 'unknown')),
  CONSTRAINT facility_departments_review_status_check CHECK (department_review_status IN ('draft', 'pending_review', 'approved', 'rejected', 'hold', 'archived')),
  CONSTRAINT facility_departments_source_type_check CHECK (source_type IS NULL OR source_type IN ('official_website', 'provider_submitted', 'public_directory', 'imported_source', 'manual_review', 'unknown')),
  CONSTRAINT facility_departments_source_url_format_check CHECK (source_url IS NULL OR source_url ~* '^https?://[^\s]+$'),
  CONSTRAINT facility_departments_confidence_score_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
  CONSTRAINT facility_departments_review_note_length_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000),
  CONSTRAINT facility_departments_approved_review_metadata_check CHECK (
    department_review_status <> 'approved'
    OR (reviewed_by_profile_id IS NOT NULL AND reviewed_at IS NOT NULL)
  ),
  CONSTRAINT facility_departments_public_visible_gate_check CHECK (
    public_department_visible = false
    OR (
      department_review_status = 'approved'
      AND last_checked_at IS NOT NULL
      AND (source_url IS NOT NULL OR source_name IS NOT NULL)
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS facility_departments_center_slug_unique_active_idx
  ON public.facility_departments (center_id, slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS facility_departments_center_id_idx
  ON public.facility_departments (center_id);

CREATE INDEX IF NOT EXISTS facility_departments_center_location_id_idx
  ON public.facility_departments (center_location_id)
  WHERE center_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS facility_departments_department_kind_idx
  ON public.facility_departments (department_kind);

CREATE INDEX IF NOT EXISTS facility_departments_review_status_idx
  ON public.facility_departments (department_review_status);

CREATE INDEX IF NOT EXISTS facility_departments_public_visible_idx
  ON public.facility_departments (public_department_visible)
  WHERE public_department_visible = true;

CREATE INDEX IF NOT EXISTS facility_departments_last_checked_at_idx
  ON public.facility_departments (last_checked_at)
  WHERE last_checked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS facility_departments_deleted_at_idx
  ON public.facility_departments (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.doctor_department_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_department_id uuid NOT NULL REFERENCES public.facility_departments(id),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id),
  doctor_practice_location_id uuid NULL REFERENCES public.doctor_practice_locations(id),
  assignment_role text NOT NULL DEFAULT 'unknown',
  assignment_review_status text NOT NULL DEFAULT 'draft',
  public_assignment_visible boolean NOT NULL DEFAULT false,
  source_url text NULL,
  source_name text NULL,
  source_type text NULL,
  last_checked_at timestamptz NULL,
  confidence_score numeric(5,2) NULL,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  review_note text NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT doctor_department_assignments_role_check CHECK (assignment_role IN ('department_head', 'consultant', 'specialist', 'staff_doctor', 'visiting_doctor', 'resident', 'unknown')),
  CONSTRAINT doctor_department_assignments_review_status_check CHECK (assignment_review_status IN ('draft', 'pending_review', 'approved', 'rejected', 'hold', 'archived')),
  CONSTRAINT doctor_department_assignments_source_type_check CHECK (source_type IS NULL OR source_type IN ('official_website', 'provider_submitted', 'public_directory', 'imported_source', 'manual_review', 'unknown')),
  CONSTRAINT doctor_department_assignments_source_url_format_check CHECK (source_url IS NULL OR source_url ~* '^https?://[^\s]+$'),
  CONSTRAINT doctor_department_assignments_confidence_score_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
  CONSTRAINT doctor_department_assignments_review_note_length_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000),
  CONSTRAINT doctor_department_assignments_approved_review_metadata_check CHECK (
    assignment_review_status <> 'approved'
    OR (reviewed_by_profile_id IS NOT NULL AND reviewed_at IS NOT NULL)
  ),
  CONSTRAINT doctor_department_assignments_public_visible_gate_check CHECK (
    public_assignment_visible = false
    OR (
      assignment_review_status = 'approved'
      AND last_checked_at IS NOT NULL
      AND (source_url IS NOT NULL OR source_name IS NOT NULL)
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS doctor_department_assignments_department_doctor_null_practice_unique_active_idx
  ON public.doctor_department_assignments (facility_department_id, doctor_id)
  WHERE doctor_practice_location_id IS NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS doctor_department_assignments_department_doctor_practice_unique_active_idx
  ON public.doctor_department_assignments (facility_department_id, doctor_id, doctor_practice_location_id)
  WHERE doctor_practice_location_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS doctor_department_assignments_department_id_idx
  ON public.doctor_department_assignments (facility_department_id);

CREATE INDEX IF NOT EXISTS doctor_department_assignments_doctor_id_idx
  ON public.doctor_department_assignments (doctor_id);

CREATE INDEX IF NOT EXISTS doctor_department_assignments_practice_location_id_idx
  ON public.doctor_department_assignments (doctor_practice_location_id)
  WHERE doctor_practice_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS doctor_department_assignments_review_status_idx
  ON public.doctor_department_assignments (assignment_review_status);

CREATE INDEX IF NOT EXISTS doctor_department_assignments_public_visible_idx
  ON public.doctor_department_assignments (public_assignment_visible)
  WHERE public_assignment_visible = true;

CREATE INDEX IF NOT EXISTS doctor_department_assignments_deleted_at_idx
  ON public.doctor_department_assignments (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.department_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_department_id uuid NOT NULL REFERENCES public.facility_departments(id),
  center_service_id uuid NULL REFERENCES public.center_services(id),
  taxonomy_group_id uuid NULL REFERENCES public.taxonomy_groups(id),
  service_category_id uuid NULL REFERENCES public.service_categories(id),
  service_id uuid NULL REFERENCES public.services(id),
  specialty_id uuid NULL REFERENCES public.specialties(id),
  display_name_en text NULL,
  display_name_ar text NULL,
  description_en text NULL,
  description_ar text NULL,
  service_review_status text NOT NULL DEFAULT 'draft',
  public_service_visible boolean NOT NULL DEFAULT false,
  source_url text NULL,
  source_name text NULL,
  source_type text NULL,
  last_checked_at timestamptz NULL,
  confidence_score numeric(5,2) NULL,
  reviewed_by_profile_id uuid NULL REFERENCES public.profiles(id),
  reviewed_at timestamptz NULL,
  review_note text NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT department_services_scope_check CHECK (
    center_service_id IS NOT NULL
    OR service_id IS NOT NULL
    OR specialty_id IS NOT NULL
    OR service_category_id IS NOT NULL
  ),
  CONSTRAINT department_services_review_status_check CHECK (service_review_status IN ('draft', 'pending_review', 'approved', 'rejected', 'hold', 'archived')),
  CONSTRAINT department_services_source_type_check CHECK (source_type IS NULL OR source_type IN ('official_website', 'provider_submitted', 'public_directory', 'imported_source', 'manual_review', 'unknown')),
  CONSTRAINT department_services_source_url_format_check CHECK (source_url IS NULL OR source_url ~* '^https?://[^\s]+$'),
  CONSTRAINT department_services_confidence_score_check CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
  CONSTRAINT department_services_review_note_length_check CHECK (review_note IS NULL OR char_length(btrim(review_note)) <= 1000),
  CONSTRAINT department_services_approved_review_metadata_check CHECK (
    service_review_status <> 'approved'
    OR (reviewed_by_profile_id IS NOT NULL AND reviewed_at IS NOT NULL)
  ),
  CONSTRAINT department_services_public_visible_gate_check CHECK (
    public_service_visible = false
    OR (
      service_review_status = 'approved'
      AND last_checked_at IS NOT NULL
      AND (source_url IS NOT NULL OR source_name IS NOT NULL)
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS department_services_department_center_service_unique_active_idx
  ON public.department_services (facility_department_id, center_service_id)
  WHERE center_service_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS department_services_department_id_idx
  ON public.department_services (facility_department_id);

CREATE INDEX IF NOT EXISTS department_services_center_service_id_idx
  ON public.department_services (center_service_id)
  WHERE center_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS department_services_service_id_idx
  ON public.department_services (service_id)
  WHERE service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS department_services_specialty_id_idx
  ON public.department_services (specialty_id)
  WHERE specialty_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS department_services_review_status_idx
  ON public.department_services (service_review_status);

CREATE INDEX IF NOT EXISTS department_services_public_visible_idx
  ON public.department_services (public_service_visible)
  WHERE public_service_visible = true;

CREATE INDEX IF NOT EXISTS department_services_deleted_at_idx
  ON public.department_services (deleted_at)
  WHERE deleted_at IS NOT NULL;

ALTER TABLE public.facility_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_department_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_services ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_facility_departments_set_updated_at') THEN
    CREATE TRIGGER trg_facility_departments_set_updated_at
      BEFORE UPDATE ON public.facility_departments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_doctor_department_assignments_set_updated_at') THEN
    CREATE TRIGGER trg_doctor_department_assignments_set_updated_at
      BEFORE UPDATE ON public.doctor_department_assignments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_department_services_set_updated_at') THEN
    CREATE TRIGGER trg_department_services_set_updated_at
      BEFORE UPDATE ON public.department_services
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
