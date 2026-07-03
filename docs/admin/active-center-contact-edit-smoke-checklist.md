# Active Center Contact Edit Smoke Checklist

This checklist verifies the guarded active-center public contact correction path after the backend action, edit page, table link, and edit guard are merged.

## Scope

This checklist is for active centers only. It does not approve bulk activation, does not return an active center to draft, and does not open full provider editing.

Allowed surface:

- `/admin/active-centers`
- `/admin/active-centers/[centerId]/edit-contact`
- `/admin/active-centers/[centerId]/gates`
- English public center profile route
- Arabic public center profile route

Allowed edit fields:

- Primary phone
- Secondary phone
- WhatsApp phone
- Email
- Website URL
- Map URL

Forbidden during this smoke test:

- verification status changes
- billing changes
- claim state changes
- commercial add-ons
- taxonomy changes
- description or profile copy changes
- media changes
- services changes
- fake contact values
- guessed map URL
- manual database edits
- manual sitemap edits
- returning the active center to draft

## Test candidate

Use one already-active center only. For the first live check, use Aster Royal Al Raffah Hospital if it is active and present in `/admin/active-centers`.

Record before editing:

- Center id:
- Slug:
- English public profile:
- Arabic public profile:
- Primary active location id:
- Existing phone value: yes / no
- Existing WhatsApp value: yes / no
- Existing email value: yes / no
- Existing website value: yes / no
- Existing map URL value: yes / no

## Edit flow

1. Open `/admin/active-centers`.
2. Confirm the active center row has these links:
   - English public profile
   - Arabic public profile
   - View public action gates
   - Edit public contact info
3. Open `Edit public contact info`.
4. Confirm the page shows `ACTIVE_CENTER_CONTACT_EDIT`.
5. Confirm the form shows only these editable fields:
   - Primary phone
   - Secondary phone
   - WhatsApp phone
   - Email
   - Website URL
   - Map URL
6. Enter only real provider-confirmed values.
7. Do not guess the map URL from address text.
8. Click `Save public contact details`.

## Gates verification

Open `/admin/active-centers/[centerId]/gates` after saving.

Expected gates:

- Review = approved
- Actions > 0
- Phone value = yes when a phone was saved
- Phone visible = yes when a phone was saved
- WhatsApp value = yes when WhatsApp was saved
- WhatsApp visible = yes when WhatsApp was saved
- Email value = yes when email was saved
- Email visible = yes when email was saved
- Website value = yes when website was saved
- Map URL = yes when map URL was saved
- Location ID is present when an active location exists

## Public profile verification

Refresh both public routes after saving.

Expected public behavior:

- Phone action appears only when a saved phone value is visible.
- WhatsApp action appears only when a saved WhatsApp value is visible.
- Email action appears only when a saved email value is visible.
- Website action appears only when a saved website value exists.
- Location action appears only when the primary active location has map URL.
- Medical safety copy remains visible.
- No best/top/rating/open-now/booking/insurance/MOH claims are introduced.

## Debug map

If public buttons do not appear, use gates before touching code or data again.

- Actions = 0 means contact values are missing or approval/visibility failed.
- Website value = no means website is not saved on the center.
- Map URL = no means the location button should not appear.
- Phone value = yes and Phone visible = no means visibility did not update.
- WhatsApp value = yes and WhatsApp visible = no means visibility did not update.
- Email value = yes and Email visible = no means visibility did not update.
- Review is not approved means the contact edit action did not complete correctly.
- Location ID is missing means there is no active location to receive map URL.

## Pass criteria

The smoke test passes only when:

- the edit page saves real public contact details without manual database edits
- gates show approved review and visibility only for non-empty values
- public action buttons match the gates
- sitemap and public profile paths are revalidated by the action
- no forbidden admin workflow is used

Passing this smoke test does not approve bulk active-center editing or full active-provider profile editing.
