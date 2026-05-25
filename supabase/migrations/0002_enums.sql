do $$ begin
  create type app_locale as enum ('en', 'ar');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type country_code as enum ('om');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type provider_status as enum ('draft', 'pending_review', 'active', 'inactive', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type claim_status as enum ('started', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type plan_interval as enum ('monthly', 'quarterly', 'semi_annual', 'annual');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type consent_type as enum ('cookie_necessary', 'cookie_analytics', 'cookie_marketing', 'medical_disclaimer', 'terms', 'privacy');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type notification_channel as enum ('email', 'sms', 'whatsapp', 'push');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type sponsored_slot_type as enum ('featured_partner', 'sponsored_result', 'homepage_featured');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type audit_actor_type as enum ('system', 'admin', 'provider_user', 'patient_user', 'anonymous');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type audit_action_type as enum ('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'claim', 'publish', 'unpublish');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type center_type as enum (
    'clinic',
    'hospital',
    'dental_clinic',
    'beauty_clinic',
    'laboratory',
    'imaging_center',
    'pharmacy',
    'wellness_center',
    'physiotherapy_center',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

