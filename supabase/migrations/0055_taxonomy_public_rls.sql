alter table public.healthcare_verticals enable row level security;
alter table public.center_categories enable row level security;
alter table public.center_category_assignments enable row level security;

create policy healthcare_verticals_select_public_active
  on public.healthcare_verticals
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and is_active = true
    and (
      public_directory_enabled = true
      or public_profile_enabled = true
    )
  );

create policy center_categories_select_public_active
  on public.center_categories
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and is_active = true
    and (
      public_directory_enabled = true
      or public_profile_enabled = true
    )
    and exists (
      select 1
      from public.healthcare_verticals verticals
      where verticals.id = center_categories.vertical_id
        and verticals.deleted_at is null
        and verticals.is_active = true
        and (
          verticals.public_directory_enabled = true
          or verticals.public_profile_enabled = true
        )
    )
  );

create policy center_category_assignments_select_public_approved
  on public.center_category_assignments
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and is_public = true
    and review_status = 'approved'
    and exists (
      select 1
      from public.centers centers
      where centers.id = center_category_assignments.center_id
        and centers.deleted_at is null
        and centers.status = 'active'
        and centers.is_active = true
    )
    and exists (
      select 1
      from public.center_categories categories
      where categories.id = center_category_assignments.category_id
        and categories.deleted_at is null
        and categories.is_active = true
        and (
          categories.public_directory_enabled = true
          or categories.public_profile_enabled = true
        )
    )
    and exists (
      select 1
      from public.healthcare_verticals verticals
      where verticals.id = center_category_assignments.vertical_id
        and verticals.deleted_at is null
        and verticals.is_active = true
        and (
          verticals.public_directory_enabled = true
          or verticals.public_profile_enabled = true
        )
    )
  );
