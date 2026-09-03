# Cloudflare Web Migration Readiness

Status: PR A readiness only. No Production DNS cutover. No Agent Production activation.

## Scope and authority

- Repository: `hamed665/drkhaleej` only.
- Baseline main: `1b33835ceda3ebce9b1bc671f87e7e67b7594ee9`.
- Build mode remains `PHASED_BUILD_ONLY`.
- Existing phase locks, RLS/security, SEO/indexing and Human Review authorities remain unchanged.
- `NEXT_PUBLIC_APP_URL` is already provider-neutral and remains the application URL contract.
- No Supabase schema change is required or authorized by this hosting migration.

## Cloudflare runtime evidence

- Next.js: `16.2.7`.
- `vinext check` completed successfully on the migration branch.
- Official Vinext Cloudflare scaffold is present.
- Worker entry: `vinext/server/fetch-handler`.
- Static assets: `dist/client` via `ASSETS` binding.
- `nodejs_compat` is enabled.
- Existing repository validation gates passed after the Vinext scaffold was generated.
- `pnpm build:vinext` completed successfully.
- The normal CI permanently runs both `vinext check` and the Vinext Cloudflare build for this branch/runtime configuration.

The generated Vinext CDN adapter descriptor is normalized so its optional `options` field is materialized as an object under this repository's strict `exactOptionalPropertyTypes` TypeScript configuration. TypeScript strictness is not weakened and the Cloudflare CDN adapter remains enabled.

### Unauthenticated temporary Cloudflare deployment probe

A temporary Wrangler deployment probe was executed without using the user's Cloudflare account, Production domain, DNS route, Supabase credential or Production secret. The first workflow attempt failed before deployment because `actions/setup-node` requested pnpm caching before Corepack made pnpm available; the toolchain ordering was corrected and the second attempt reached Cloudflare.

The corrected probe established the following deployment-path evidence:

- Dependency installation completed successfully with the locked pnpm version.
- The full Vinext Worker build completed successfully, including App Router, Pages API and Server Action/server-reference compilation.
- Wrangler accepted the generated Worker configuration and uploaded **66 static assets** successfully.
- Wrangler reported Worker upload size of **4351.43 KiB raw / 1063.82 KiB gzip**.
- Cloudflare then rejected Worker script validation with code `10027` solely because Wrangler `--temporary` uses a temporary free account capped at **1 MiB** Worker size.
- The returned Cloudflare error explicitly states that a paid Workers plan accepts Workers up to **10 MiB**, so the measured bundle is above the temporary/free limit but below the paid-plan limit targeted by this migration.
- No Worker runtime request was executed because validation stopped deployment before a temporary `workers.dev` runtime became available.
- The temporary claim URL, temporary account identity and any token-like values were intentionally suppressed from logs/evidence.

This probe is useful upload/validation evidence, but it is **not** a substitute for the paid-account candidate gate. Actual runtime compatibility, safe Server Action execution, auth/session behavior and cache/header parity still require deployment to the existing paid Cloudflare account with the bounded Preview environment described below.

## HTTP handler inventory

Exact HTTP handler count at the baseline main is five.

| Route | Router | Method | Auth/session | Side effect | Runtime / compatibility note |
| --- | --- | --- | --- | --- | --- |
| `/api/callback-requests` | App | POST | none | Supabase-backed callback request creation | Public catalog validation uses the anon client; duplicate detection and insertion use the server-only service-role client. Do not invoke during the lower-privilege candidate phase. |
| `/api/provider-onboarding-leads` | App | POST | none | Supabase-backed onboarding lead creation | Duplicate detection and insertion use the server-only service-role client. Do not invoke during the lower-privilege candidate phase. |
| `/api/internal/automation` | App | POST | Ed25519 service JWT, replay/fencing contracts | Existing automation control-plane operations | Explicit `runtime = "nodejs"`; 64 KiB bounded streaming body; `Buffer`; `node:crypto` transitively; `nodejs_compat` build-proven but runtime smoke still required |
| `/auth/callback` | App | GET | Supabase auth code exchange | session establishment | Uses the session-aware Supabase client backed by the public URL + anon key; redirect is request-origin based and has no Vercel-specific URL dependency. |
| `/api/_drk/public-hospital-profile/[locale]/[country]/[hospitalSlug]` | Pages | GET | public guard | read-only profile lookup | `no-store, private`; Pages API compatibility included in Vinext build |

## Server Action inventory

The earlier readiness statement that this repository had zero Server Actions was incorrect and is superseded by deterministic source-tree evidence in `docs/project-state/CLOUDFLARE_SERVER_ACTION_INVENTORY.md`.

At source commit `ddb276780dd88072805a0bb03d5bfc1274e231f7`, the scanner inspected 931 JavaScript/TypeScript source files and found:

- **35 files** containing an exact `use server` directive.
- **33 files** with module-level `use server` as the first executable statement.
- **2 files** containing inline-only Server Actions.
- **53 exact `use server` directive lines** in total.

These actions span admin center management, CMS/FAQ, subscriptions, media, provider onboarding and import/readiness workflows. Build success proves that Vinext can compile these modules, but it does **not** establish runtime parity for Server Actions.

Candidate QA therefore must exercise representative **safe** Server Actions through the deployed Worker, including session/auth-bound behavior and a bounded ordinary admin action where an existing test-safe path is available. Destructive, publish, rollback, index-promotion, sitemap-promotion, bulk-import, activation or externally visible actions must not be invoked merely to prove hosting compatibility. Existing authorization and side-effect contracts remain authoritative.

## Automation boundary

PR #977 remains separate, open and unmerged. It was written for the prior Vercel Preview + Render Background Worker architecture and is not merged into the Web migration.

The Cloudflare Web migration does not activate the long-running polling worker and does not expand Production automation authority. The following contracts remain closed/preserved:

- Preview-only automation boundary.
- Ed25519 service identity.
- Maximum JWT TTL 300 seconds.
- JTI replay protection.
- Request/body binding and fencing semantics.
- No direct worker database credential.
- Denied publish, rollback, public promotion, index promotion and sitemap promotion scopes.

Any replacement of the Vercel + Render worker ADR belongs to the later explicit Agent-runtime amendment after Web Production is stable.

## Environment parity contract

Required Web runtime environment names are discovered from repository contracts only. Secret values must never be committed or logged.

Public/runtime:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `NEXT_PUBLIC_SUPPORTED_LOCALES`
- `NEXT_PUBLIC_DEFAULT_COUNTRY`
- `NEXT_PUBLIC_ALLOWED_PUBLIC_LOCALES`
- `NEXT_PUBLIC_ALLOWED_PUBLIC_COUNTRIES`
- `NEXT_PUBLIC_ENABLE_INDEXING`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- optional WhatsApp settings documented in `.env.example`

Server-only Web/API:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DRMUSCAT_PUBLIC_FAQ_CMS_ENABLED`

Automation settings remain fail-closed and are not made Production-active by PR A.

### Candidate credential preflight

A read-only GitHub Actions preflight checked only presence/missing state and identity relationships. It did not print, persist or commit secret values or Supabase project refs.

Verified existing repository secrets/contracts:

- Preview Supabase project ref: **present**.
- Production Supabase project ref: **present**.
- Preview and Production project refs: **distinct**.
- Preview database URL: **present**.
- Preview database identity matches the Preview project ref: **yes**.

Bounded alias probing also confirmed that no existing repository secret is available under the checked canonical or common alternate names for:

- Cloudflare API token.
- Cloudflare account ID.
- Preview Supabase anon key.
- Preview Supabase service-role key.

The connected Supabase account available to this migration session does not expose a DrKhaleej project, so Smart Visions project credentials must never be substituted.

### Minimum-secret candidate phases

The Supabase helper boundary is deliberately split:

- Public and ordinary server clients call `getSupabasePublicEnv()` and require only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Session-aware auth also uses the public URL + anon key.
- Privileged access is isolated behind `createSupabaseServiceRoleClient()` and reads `SUPABASE_SERVICE_ROLE_KEY` only when that client is invoked.

Therefore the first non-Production Cloudflare candidate may use a lower-privilege environment and is blocked only on:

1. Cloudflare API token with Worker deployment permission for the existing paid account.
2. Cloudflare account ID for that same account.
3. The **Preview** Supabase anon/publishable-compatible runtime key mapped to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

`NEXT_PUBLIC_SUPABASE_URL` can be constructed from the already verified Preview project ref without printing the ref. The first candidate must not contain a Production Supabase key.

The first candidate is intentionally limited to public/read-only pages, static assets, auth/session flow, non-mutating handler behavior, SEO/header/cache checks and safe auth-bound Server Action compatibility. The two public POST creation endpoints that invoke the service-role client are excluded from this lower-privilege smoke phase.

Full Web runtime parity still requires a later Preview-only privileged phase with the Preview service-role key before PR A can be declared cutover-ready. That later phase must validate service-role-dependent runtime behavior without creating junk leads/callbacks and without invoking publish, rollback, index, sitemap, bulk-import, activation or other externally visible side effects.

## Candidate and cutover gates

PR A cannot be considered complete from build evidence alone. It still requires:

1. Public pre-cutover DNS/origin/TLS/header/SEO baseline. **Captured.**
2. Lower-privilege Cloudflare candidate Worker deployment in the existing paid account, without Production custom-domain routing.
3. Lower-privilege environment parity using the verified Preview identity and Preview anon key only.
4. EN/AR Oman public smoke.
5. Admin login/auth callback smoke.
6. Non-mutating HTTP-handler smoke, including a fail-closed automation check.
7. Representative safe Server Action runtime smoke without triggering publish/rollback/index/sitemap/bulk-import/external side effects.
8. Static asset/image, canonical/hreflang, robots and sitemap comparison.
9. Cache behavior validation for the Vinext/Cloudflare runtime.
10. Controlled request/load observation and Worker Tail with zero unexplained 5xx.
11. Preview-only privileged runtime parity using the Preview service-role key for service-role-dependent code paths, without creating test entities or relaxing existing security contracts.

No Production DNS mutation is permitted until those gates are green and an executable rollback state has been captured.
