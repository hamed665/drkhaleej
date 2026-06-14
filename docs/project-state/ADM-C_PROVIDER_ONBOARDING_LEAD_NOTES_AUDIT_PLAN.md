# ADM-C — Admin Provider Onboarding Lead Notes/Audit Plan

## 1. Purpose

ADM-C is a documentation-only planning phase for future admin provider onboarding lead notes and audit trail support.

ADM-C does not authorize implementation by itself. It does not create notes, write audit events, add migrations, add RLS policies, change admin routes, change server actions, or change public/provider-facing behavior.

## 2. Current ADM-B baseline

After ADM-B, the implemented admin provider onboarding lead workflow is limited to the minimal status/priority mutation baseline:

- A platform admin can update provider onboarding lead `status`.
- A platform admin can update provider onboarding lead `priority`.
- The mutation is server-side only.
- The mutation uses the platform-admin guard before creating/using the service-role Supabase client.
- The mutation enforces status and priority whitelists.
- The mutation enforces `deleted_at IS NULL` safety when selecting and updating leads.
- The mutation may set `handled_at` under the minimal ADM-B rule.
- No private admin notes exist for provider onboarding leads.
- No audit-write workflow exists for provider onboarding lead status/priority changes.
- No assignment workflow exists.
- No conversion workflow exists.
- No contact-action workflow exists.
- No public publishing workflow exists.

## 3. Problem to solve

Future notes/audit support is needed because:

- Status and priority changes need traceability.
- Admins need internal context about why a lead moved between statuses.
- Future conversion work needs a history of decisions before creating candidate/provider records.
- Future sales/contact workflow needs separation between private notes and public provider data.
- Audit/history must not expose private admin notes publicly.

## 4. Existing database/audit inventory

Inventory findings from the existing migrations and generated Supabase types:

- A generic `public.audit_logs` table already exists.
  - It includes actor fields, action type, entity type/id, request metadata fields, before/after JSON, generic metadata, timestamps, and soft delete.
  - Generated types include `audit_logs` rows/inserts/updates.
- Generic audit RLS exists for read access only:
  - `public.can_view_audit_log(target_audit_log_id uuid)` allows only platform admins to view non-deleted audit logs.
  - `audit_logs_select_platform_admin` is a SELECT policy for authenticated platform admins.
- Provider onboarding lead-specific notes/audit tables do not appear to exist in the current migrations or generated types.
- `provider_onboarding_leads` currently has `metadata jsonb`, but ADM-C should not treat this as a notes/audit store.
- Review-specific companion audit/event tables exist, including `review_moderation_events` and `review_audit_events`, but they are review-domain tables and are not appropriate as provider onboarding lead history storage.
- Existing generic `audit_logs` may be useful for broad platform audit trails, but its enum-constrained `action_type` and generic before/after JSON model may be too coarse for private lead notes and lead-history UX without further design.
- A new provider onboarding lead companion event table is likely needed for lead-specific history and private notes.
- If the future implementation chooses to write into `audit_logs`, the exact write path, enum coverage, note handling, and privacy rules require confirmation before implementation.
- Service-role-only access is the safer initial pattern for this workflow unless a future approved RLS phase explicitly designs and validates direct authenticated admin policies.

## 5. Proposed future data model options

No migrations are created in ADM-C. The following are future options only.

### Option A — `provider_onboarding_lead_events` table

A future append-only companion event table for:

- `lead_id`
- `actor_profile_id`
- `event_type`
- `old_status`
- `new_status`
- `old_priority`
- `new_priority`
- `note_text`
- `created_at`
- `metadata`

Benefits:

- Smallest lead-specific model for status, priority, and note history.
- Queryable by lead for a simple private “Lead history” timeline.
- Keeps lead events separate from the lead row and avoids overloading `provider_onboarding_leads.metadata`.
- Supports future conversion workflow by preserving pre-conversion decision history.
- Can keep notes private/admin-only by design.

Risks:

- Requires a new migration and generated Supabase types in a future approved DB phase.
- Needs careful append-only application behavior and potentially database constraints/policies.
- Needs actor identity to avoid weak audit entries.
- If RLS policies are added too early or too broadly, private notes could leak.

Implementation complexity:

- Low to moderate.
- One companion table, indexes, constraints, generated types, and server-only read/write helpers would likely be enough for the first implementation phase.

RLS implications:

- Safer initial approach is RLS enabled with no broad client policies and service-role-only server access, or a narrowly scoped authenticated platform-admin SELECT/INSERT policy only in a future explicit RLS phase.
- Deleted leads should not receive new events unless explicitly approved.

Future conversion support:

- Yes. Events can document qualification, rejection, conversion decision context, and note history before any candidate/provider records are created.

Private notes support:

- Yes, if `note_text` is private/admin-only, length-limited, validated, and never exposed through public/provider routes.

### Option B — `provider_onboarding_lead_notes` table plus audit events

A future private notes table for human notes and a separate audit/event table for machine-readable status/priority changes.

Benefits:

- Strong separation between free-text human notes and machine-readable status/priority audit events.
- Easier to apply different retention, validation, and display rules for notes vs. structured audit events.
- Better long-term model if notes become threaded, editable only by policy, or subject to separate export/reporting controls.
- Supports future conversion workflow by combining structured decision events with separate internal context.
- Can keep notes private/admin-only by design.

Risks:

- More tables and more joins for the admin detail page.
- More RLS/policy surface area to secure.
- Higher risk of implementing more than the minimal needed workflow.
- Requires clear rules for whether note creation also emits an audit event.

Implementation complexity:

- Moderate.
- Requires two companion models, generated types, read helpers, write helpers, validation, and explicit ordering rules for a single history timeline.

RLS implications:

- Both tables must be private/admin-only.
- Notes need stricter text validation and display constraints than structured audit events.
- Service-role-only server access is still the safest initial pattern unless an explicit RLS phase designs direct platform-admin policies.

Future conversion support:

- Yes. This option supports conversion workflow well, but may be more than the smallest safe next step.

Private notes support:

- Yes, if the notes table is admin-only and excluded from public/provider APIs, exports, metadata, sitemap, SEO, and public pages.

## 6. Recommended future approach

Recommended smallest safe future approach:

- Start with a `provider_onboarding_lead_events` companion table in a future approved migration phase.
- Make the event model append-only from application code.
- Support initial event types such as:
  - `status_changed`
  - `priority_changed`
  - `note_added`
- Keep notes private/admin-only.
- Do not expose notes or audit events on public pages.
- Do not use `provider_onboarding_leads.metadata` for notes/audit.
- Keep service-role usage server-only.
- Revisit whether generic `audit_logs` should receive a parallel high-level audit entry only after the provider onboarding lead event model is approved.

The existing generic `audit_logs` table is useful platform infrastructure, but it is not clearly better for this workflow because provider onboarding lead notes need a lead-specific private history model and should not be stored as broad generic JSON without a clear UX/query contract.

## 7. Future ADM-D / DB-A implementation boundary

If a new table is needed, the next implementation phase should be one of these explicit options rather than a guessed final phase name:

- `DB-A`: provider onboarding lead events migration/RLS plan
- `ADM-D-AUDIT-DB`: provider onboarding lead events migration/RLS plan

A future database phase should likely include:

- Migration for the event table.
- Generated Supabase types update.
- RLS policy design or service-role-only pattern.
- Database validation.
- RLS validation if policies are added.

ADM-C does not name a final migration number and does not create a migration.

## 8. Future admin UX requirements

Future minimal admin UX should remain private and narrow:

- The lead detail page can show a private “Lead history” section.
- Admin can add a short private note.
- Status/priority update can create an event entry.
- Notes must be clearly marked private/admin-only.
- No notes on public pages.
- No contact buttons.
- No conversion buttons.
- No publish buttons.
- No billing controls.
- No verified badge controls.

## 9. Security requirements

Future notes/audit implementation must follow these requirements:

- All notes/audit writes must be admin-only.
- Platform admin guard is required before any notes/audit read or write.
- Service role must remain server-only.
- No public API route for notes/audit.
- No client-side Supabase writes.
- No raw database errors in UI.
- No sensitive metadata like IP/user-agent exposed in admin UI unless separately approved.
- Notes must be length-limited.
- Notes must reject HTML/script-like content if stored as text.
- Notes must not be used as public description/content.
- Deleted leads must not receive new notes/events unless explicitly approved.

## 10. Privacy and compliance boundaries

Future notes/audit work must preserve these boundaries:

- Notes may contain sensitive operational comments and must stay private.
- Avoid storing medical claims, diagnosis, patient data, or unnecessary personal data in admin notes.
- Admin notes should not be used as provider-facing messages.
- Contact actions require a separate phase.
- Future export/reporting must exclude private notes unless explicitly approved.

## 11. Validation requirements for future implementation

Future implementation PRs that add tables/RLS should run:

- `pnpm db:validate:migrations`
- `pnpm test:db:rls`
- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Future implementation PRs that only add UI/actions without DB changes should run:

- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## 12. Risks and blockers

- Adding notes without audit structure may create messy unqueryable history.
- Using `provider_onboarding_leads.metadata` for notes/audit would be risky and hard to validate.
- Audit without actor identity is weak.
- Notes without privacy controls may leak sensitive admin context.
- Conversion workflow should wait for event/history design.
- Public listing publishing remains out of scope.
- Assignment workflow remains out of scope.
- Contact-action workflow remains out of scope.

## 13. Recommended next sequence

After ADM-C:

- `DB-A` or `ADM-D-AUDIT-DB`: provider onboarding lead event table migration/RLS plan.
- `ADM-D`: implement private lead history/read UI.
- `ADM-E`: implement private note add action.
- `DATA-A`: candidate/provider conversion model plan.
- `DATA-B`: lead-to-candidate conversion implementation only after `DATA-A`.
- `SEED-A`: real seed/import phase only after explicit approval.

## 14. Validation for ADM-C

Because ADM-C is documentation-only, run:

- `pnpm routes:check`
- `pnpm typecheck`
- `pnpm lint`

If validation is skipped or fails, report honestly and do not claim success.
