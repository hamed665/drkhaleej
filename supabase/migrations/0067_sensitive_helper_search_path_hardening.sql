-- SEC-HELPER-SEARCH-PATH-A: sensitive helper search_path hardening
-- Keep this migration narrow: only fixed search_path on existing helper functions.

alter function public.current_profile_id()
set search_path = public, auth, pg_temp;

alter function public.is_platform_admin()
set search_path = public, auth, pg_temp;

alter function public.is_provider_user()
set search_path = public, auth, pg_temp;

alter function public.is_patient_user()
set search_path = public, auth, pg_temp;

alter function public.is_active_center_member(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_manage_center(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_center_private_data(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_patient_contact(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_appointment(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_review_private(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_review_report(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_media_asset_private(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_entity_media_private(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_center_subscription(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_sponsored_campaign(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_sponsored_placement_private(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_consent_log(uuid)
set search_path = public, auth, pg_temp;

alter function public.can_view_audit_log(uuid)
set search_path = public, auth, pg_temp;
