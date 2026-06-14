# ADM-A: Provider Onboarding Lead Mutation Plan

## 1. Purpose

ADM-A is a documentation-only planning phase for a future admin mutation phase. It records the current provider onboarding lead admin baseline and defines the smallest safe direction for a later implementation PR.

This document does not authorize implementation by itself. ADM-A must not add, modify, or enable provider onboarding lead mutations.

Four-axis mapping for this planning phase:

- Execution Phase: Phase 4 — Admin Foundation, documentation-only planning for a future admin basic workflow.
- Lock Scope: Phase 5 — Admin Basic, documentation-only; no implementation files are approved by this document.
- Product Module: Phase 6 — Admin Foundation.
- Subphase ID: ADM-A.

## 2. Current implemented admin baseline

The current admin surface is limited to a protected, read-only provider onboarding lead review baseline:

- Protected root-level `/admin` exists.
- Admin routes are root-level routes and are not localized.
- Provider onboarding lead list page exists at `/admin/provider-onboarding-leads`.
- Provider onboarding lead detail page exists at `/admin/provider-onboarding-leads/[leadId]`.
- Current UI is read-only.
- Current server/admin query layer can list provider onboarding leads and read a single lead by ID.
- No status mutation is implemented.
- No priority mutation is implemented.
- No assignment workflow is implemented.
- No conversion workflow is implemented.
- No contact-action workflow is implemented.
- No audit-write workflow is implemented.

Current code confirms the read-only intent in the admin landing copy, list copy, and detail safety note. The server query layer currently exposes list/read functions only and filters out soft-deleted rows with `deleted_at IS NULL`.

## 3. Current provider onboarding lead data model

The existing `provider_onboarding_leads` table is defined in `supabase/migrations/0050_provider_onboarding_leads.sql`, and generated types in `supabase/types/database.types.ts` match the same field set.

Relevant current fields are:

- `id`
- `center_name`
- `contact_name`
- `phone`
- `whatsapp`
- `email`
- `provider_type`
- `city_text`
- `area_text`
- `preferred_language`
- `locale`
- `country_code`
- `request_source`
- `status`
- `priority`
- `message`
- `metadata`
- `consent_to_contact`
- `handled_at`
- `created_at`
- `updated_at`
- `deleted_at`

Additional current constraints relevant to future mutations:

- `country_code` is constrained to `om`.
- `provider_type` is constrained to `clinic`, `medical_center`, `dental_clinic`, `pharmacy`, `lab`, `wellness`, or `other`.
- `status` has a database check constraint.
- `priority` has a database check constraint.
- `consent_to_contact` must be `true`.
- `request_source` is constrained to `for_providers_page`.
- RLS is enabled on `provider_onboarding_leads`.

## 4. Current status and priority values

Current status values are confirmed in the migration check constraint, admin list page filters, server/admin normalization, and admin UI type definitions:

- `new`
- `reviewing`
- `contacted`
- `qualified`
- `rejected`
- `converted`
- `closed`

Current priority values are confirmed in the migration check constraint, admin list page filters, server/admin normalization, and admin UI type definitions:

- `low`
- `normal`
- `high`

The generated Supabase TypeScript type currently represents `status` and `priority` as `string` fields rather than generated enum union types, so future ADM-B implementation should keep its own whitelist and should not trust arbitrary string input.

## 5. Future ADM-B implementation goal

The next implementation phase should be defined as ADM-B:

> Add a minimal admin-only status/priority update workflow for provider onboarding leads.

Future ADM-B should allow:

- Updating `status`.
- Updating `priority`.
- Optionally setting `handled_at` when moving to terminal or handled statuses, if consistent with current schema and future ADM-B approval.
- Preserving read-only list/detail display behavior except for the new approved controls.
- Refreshing or redirecting safely after update.
- Using the existing admin authorization guard.
- Using the service role only in server-side admin code if that remains the established pattern.

Future ADM-B must not include:

- Assignment.
- Conversion to center/provider records.
- Contact sending.
- Email or WhatsApp automation.
- Billing.
- Plan activation.
- Verified badge activation.
- Public listing publishing.
- Review moderation.
- Dashboard access.
- Audit-write unless separately approved.
- New RLS policies unless explicitly approved.

## 6. Proposed future files for ADM-B

The smallest likely implementation candidates for a future ADM-B approval are listed below. These are proposed candidates only; this ADM-A document does not approve editing them.

- `src/server/admin/provider-onboarding-leads.ts` — likely location for a server-only, admin-guarded update function if current conventions continue.
- `src/components/admin/provider-onboarding-lead-detail.tsx` — likely location to render the approved minimal status/priority controls on the existing detail page.
- Possibly a small new client component under `src/components/admin/` if an interactive form is needed for disabled/loading/error state.
- Possibly a new server action file under `src/server/admin/` if future conventions prefer separating mutations from read queries.

Future ADM-B approval should explicitly list the final allowed files before implementation begins.

## 7. Security and permission model

Future ADM-B must preserve the current admin security model:

- Admin access must continue to go through `requirePlatformAdmin` or the existing platform-admin guard.
- Admin routes must remain root-level and must not be localized.
- No public API for admin mutations should be added.
- No client-side Supabase mutation for `provider_onboarding_leads` should be added.
- No service role keys may be exposed to client components.
- Mutation must be server-side only.
- Mutation must verify platform admin authorization before updating.
- Mutation must not bypass `deleted_at` safety.
- Mutation should reject updates for deleted leads.
- Mutation should only accept whitelisted `status` and `priority` values.
- Mutation should not allow arbitrary `metadata` writes in ADM-B.
- Mutation should not accept arbitrary column updates; ADM-B should be limited to the approved status/priority payload and any explicitly approved `handled_at` behavior.
- Error responses or UI states must not expose raw database errors or secrets.

## 8. Validation requirements for future ADM-B

Future ADM-B implementation PR should run:

- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

If migrations or RLS are touched in a future explicitly approved phase, also run:

- `pnpm db:validate:migrations`
- `pnpm test:db:rls`

ADM-B should avoid migrations and RLS changes unless those changes are explicitly approved.

## 9. UX requirements for future ADM-B

Future ADM-B should keep UX minimal and admin-only:

- Detail page should show current status and priority.
- Update controls should be simple and admin-only.
- Use existing admin page style and component patterns.
- Show clear disabled, loading, and error state if a client component is introduced.
- Avoid bulk update in ADM-B.
- Avoid inline list update in ADM-B unless separately approved.
- Preserve honest read-only display of all existing fields.
- Do not add contact buttons, WhatsApp actions, email actions, conversion buttons, or publish buttons.
- Do not imply that changing status sends outreach, creates public listings, activates billing, or grants dashboard access.

## 10. Risks and blockers

Known risks and blockers for future phases:

- Status changes without an audit trail may be acceptable only for minimal ADM-B if explicitly approved, but audit-write should be planned separately.
- Conversion workflow requires a separate DATA-A/CANDIDATE plan before implementation.
- Assignment requires a separate CRM/admin workflow phase.
- Any public visibility change is out of scope.
- Any provider dashboard linkage is out of scope.
- Service role use must remain server-only.
- Accidentally adding public mutation endpoints would be a security issue.
- Generated Supabase types currently type `status` and `priority` as `string`, so ADM-B must keep explicit whitelisting in application code.
- Current admin mutation conventions are not fully established by the provider onboarding lead baseline because the current server/admin module only implements list/read behavior. ADM-B should either follow an approved existing mutation convention elsewhere in the repo or explicitly define the convention in its task approval.

## 11. Recommended next sequence

After ADM-A, the recommended sequence is:

1. ADM-B: implement minimal status/priority update on the admin lead detail page.
2. ADM-C: optional admin lead notes/audit plan.
3. DATA-A: candidate/provider conversion model plan.
4. DATA-B: lead-to-candidate conversion implementation, only after DATA-A.
5. SEED-A: real seed/import phase only after explicit approval.

## 12. Validation for ADM-A

ADM-A is documentation-only. Required validation for this phase:

- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm lint`

Validation results must be reported honestly in the PR and final response. If any command is skipped or fails, do not claim success.
