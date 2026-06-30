-- SEC-SCHEDULE-RLS-A: schedule and appointment table RLS hardening
-- Fixes Supabase Security Advisor rls_disabled_in_public errors for scheduling tables.
-- These tables remain private by default. No anon/authenticated policies are added here.

alter table public.doctor_schedules enable row level security;
alter table public.doctor_schedule_exceptions enable row level security;
alter table public.appointment_slots enable row level security;
