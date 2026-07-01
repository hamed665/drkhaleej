-- SEC-FUNCTION-SEARCH-PATH-A: function search_path hardening
-- Supabase Security Advisor warning: set a fixed search_path on trigger helpers.
-- Keep this migration narrow: no drops, grants, policy changes, or runtime feature changes.

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    raise exception 'Expected function public.set_updated_at() was not found.';
  end if;
end $$;

alter function public.set_updated_at()
set search_path = public, pg_temp;
