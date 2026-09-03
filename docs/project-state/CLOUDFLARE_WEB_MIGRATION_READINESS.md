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

## HTTP handler inventory

Exact handler count at the baseline main is five. No `use server` Server Actions are present.

| Route | Router | Method | Auth/session | Side effect | Runtime / compatibility note |
| --- | --- | --- | --- | --- | --- |
| `/api/callback-requests` | App | POST | none | Supabase-backed callback request creation | Web Request/Response surface; smoke must avoid creating test entities |
| `/api/provider-onboarding-leads` | App | POST | none | Supabase-backed onboarding lead creation | Web Request/Response surface; smoke must avoid creating test entities |
| `/api/internal/automation` | App | POST | Ed25519 service JWT, replay/fencing contracts | Existing automation control-plane operations | Explicit `runtime = "nodejs"`; 64 KiB bounded streaming body; `Buffer`; `node:crypto` transitively; `nodejs_compat` build-proven but runtime smoke still required |
| `/auth/callback` | App | GET | Supabase auth code exchange | session establishment | Redirect is request-origin based; no Vercel-specific URL dependency |
| `/api/_drk/public-hospital-profile/[locale]/[country]/[hospitalSlug]` | Pages | GET | public guard | read-only profile lookup | `no-store, private`; Pages API compatibility included in Vinext build |

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

DrKhaleej Preview and Production Supabase project identities are not guessed. Candidate deployment remains blocked until the actual project identities and environment parity can be verified by authorized source-of-truth access.

## Candidate and cutover gates

PR A cannot be considered complete from build evidence alone. It still requires:

1. Public pre-cutover DNS/origin/TLS/header/SEO baseline.
2. Cloudflare candidate Worker deployment in the existing paid account, without Production custom-domain routing.
3. Present/missing or hash-only environment parity verification.
4. EN/AR Oman public smoke.
5. Admin login/auth callback smoke.
6. Non-mutating API smoke, including a fail-closed automation check.
7. Static asset, canonical, robots and sitemap comparison.
8. Controlled request/load observation and Worker Tail with zero unexplained 5xx.

No Production DNS mutation is permitted until those gates are green and an executable rollback state has been captured.
