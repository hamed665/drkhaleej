# Public Profile Removal Contract

This contract defines the required boundary for removing a provider profile from public discovery after it has already been activated. It is documentation-only for this phase. Runtime actions must be implemented in later scoped PRs.

## Purpose

Public profile removal exists to safely remove an active provider profile from public discovery without deleting records, losing audit evidence, changing billing state, or weakening SEO safety. Humans, being determined to turn every boolean into a business process, need this written down.

## Required behavior for future runtime implementation

A future runtime action must:

1. Require an approved platform admin permission before changing public visibility.
2. Target only a provider record that is currently public-active.
3. Move the profile out of public discovery without hard-deleting the provider record.
4. Preserve source data, audit history, locations, contact review history, media records, license fields, import evidence, and commercial records.
5. Revalidate the English public profile path.
6. Revalidate the Arabic public profile path.
7. Revalidate sitemap output after the profile is removed from public discovery.
8. Write an admin audit event with old values, new values, public paths, and a reason/status summary.
9. Keep contact visibility, claim status, billing, sponsored placement, and commercial add-ons outside this action unless a later PR explicitly scopes them.
10. Return a structured result that can be displayed safely in admin UI.

## Forbidden behavior

A future runtime action must not:

- Delete provider records.
- Delete locations, contacts, media, license data, or source evidence.
- Change subscription, billing, sponsored, claim, or commercial status.
- Reuse draft-center edit forms for active provider removal.
- Remove audit evidence.
- Mark the provider as officially rejected unless a separate review workflow exists.
- Expose removal controls on public pages.
- Change robots, sitemap, or canonical policy globally.

## Expected future state transition

The future action should use a narrow active-to-nonpublic transition. The exact database status value can be implemented later, but the contract requires these outcomes:

- public listing eligibility becomes false
- profile no longer appears in sitemap
- direct public route no longer resolves as an indexable profile
- admin can still inspect the provider record
- audit history remains visible
- source evidence remains retained

## Required future admin UI boundary

The future admin UI should present public profile removal as a guarded action separate from:

- draft editing
- profile activation
- contact visibility review
- claim handling
- billing
- sponsored visibility
- media upload
- source correction workflow

The UI must clearly state that removal affects public discovery visibility only. It must not imply permanent deletion.

## Acceptance criteria for future implementation PRs

A future implementation PR must include:

- server-side readiness helper
- server action or equivalent mutation boundary
- admin UI affordance guarded behind readiness
- audit event coverage
- sitemap/public path revalidation
- public route/indexability tests
- validator coverage added to the admin validation chain

This contract is intentionally conservative. Public pages can be created quickly; safely removing them later without turning search engines into confused raccoons requires boring rules.
