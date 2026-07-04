# Basic Profile Check

Use this check after editing an active center basic profile.

Admin path:

- `/admin/active-centers/[centerId]/edit-profile`

Allowed fields:

- English name
- Arabic name
- Short description EN
- Short description AR
- Description EN
- Description AR

Required checks:

1. Open `Edit basic profile info` from `/admin/active-centers`.
2. Confirm the page shows `ACTIVE_CENTER_BASIC_PROFILE_EDIT`.
3. Confirm only the six allowed fields are editable.
4. Save real profile copy.
5. Refresh the English and Arabic public center pages.
6. Confirm contact and location actions did not change.
7. Confirm `/admin/audit-log` includes `active_center.basic_profile_updated`.

This check does not approve full active-provider editing.
