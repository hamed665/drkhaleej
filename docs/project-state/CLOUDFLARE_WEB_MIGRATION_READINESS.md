# Cloudflare Web Migration Readiness

Status: PR A candidate runtime readiness is proven. No Production DNS cutover. No Agent Production activation.

## Scope and authority

- Repository: `hamed665/drkhaleej` only.
- Baseline main: `1b33835ceda3ebce9b1bc671f87e7e67b7594ee9`.
- Build mode remains `PHASED_BUILD_ONLY`.
- Existing phase locks, RLS/security, SEO/indexing and Human Review authorities remain unchanged.
- `NEXT_PUBLIC_APP_URL` is already provider-neutral and remains the application URL contract.
- No Supabase schema change is required or authorized by this hosting migration.
- PR #977 remains separate, open/draft and unmerged.

## Cloudflare runtime evidence

- Next.js: `16.2.7`.
- `vinext check` succeeds on the migration branch.
- Official Vinext Cloudflare scaffold is present.
- Worker entry: `vinext/server/fetch-handler`.
- Static assets: `dist/client` via `ASSETS` binding.
- `nodejs_compat` is enabled.
- Existing repository validation gates pass with the Vinext scaffold.
- `pnpm build:vinext` succeeds.
- Normal CI permanently runs both `vinext check` and the Vinext Cloudflare build.

The generated Vinext CDN adapter descriptor is normalized so its optional `options` field is materialized as an object under this repository's strict `exactOptionalPropertyTypes` TypeScript configuration. TypeScript strictness is not weakened and the Cloudflare CDN adapter remains enabled.

## Live pre-cutover baseline

`docs/project-state/CLOUDFLARE_WEB_MIGRATION_BASELINE.md` captures the public pre-cutover DNS, origin, redirect, TLS, header/cache and SEO state without mutation.

Key findings:

- authoritative nameservers are already Cloudflare;
- `www.drkhaleej.com` is still a CNAME to the existing Vercel-backed origin;
- current Production responses still identify Vercel;
- canonical Production remains `https://www.drkhaleej.com`;
- no Production DNS record has been changed by PR A.

The existing host remains the rollback origin until PR B cutover verification completes.

## HTTP handler inventory

Exact HTTP handler count at the baseline main is five.

| Route | Router | Method | Auth/session | Side effect | Candidate evidence |
| --- | --- | --- | --- | --- | --- |
| `/api/callback-requests` | App | POST | none | Supabase-backed callback request creation | Invalid `{}` returns 400 before privileged code; no test entity is created. |
| `/api/provider-onboarding-leads` | App | POST | none | Supabase-backed onboarding lead creation | Invalid `{}` returns 400 before privileged code; no test entity is created. |
| `/api/internal/automation` | App | POST | Ed25519 service JWT, replay/fencing contracts | Existing automation control-plane operations | Returns the expected fail-closed 503 with `automation_preview_boundary_closed`; no authority is opened. |
| `/auth/callback` | App | GET | Supabase auth code exchange | session establishment | No-code callback returns the expected redirect and remains request-origin based. |
| `/api/_drk/public-hospital-profile/[locale]/[country]/[hospitalSlug]` | Pages | GET | public guard | read-only profile lookup | Deliberately nonexistent slug returns 404 with exact `Cache-Control: no-store, private`. |

The two public write endpoints are intentionally not happy-path invoked merely for hosting QA because doing so would create junk callback/provider records. Existing Preview DB safety workflows remain the write-safety authority.

## Server Action inventory and runtime proof

The earlier readiness statement that this repository had zero Server Actions was incorrect and is superseded by deterministic source-tree evidence in `docs/project-state/CLOUDFLARE_SERVER_ACTION_INVENTORY.md`.

At source commit `ddb276780dd88072805a0bb03d5bfc1274e231f7`, the scanner inspected 931 JavaScript/TypeScript source files and found:

- **35 files** containing an exact `use server` directive;
- **33 files** with module-level `use server` as the first executable statement;
- **2 files** containing inline-only Server Actions;
- **53 exact `use server` directive lines** in total.

Candidate runtime proof dynamically discovers the built Vinext action ID for the existing `initializeBaseSubscriptionPlanCatalog` action and invokes it without an authenticated session. Vinext recognizes the action and returns HTTP 303 with the existing `/admin/login` auth redirect before mutation. No publish, rollback, indexing, sitemap, import, activation or external side effect is invoked for this proof.

## Paid Cloudflare candidate proof

The isolated paid-account candidate is:

`https://drkhaleej-web-candidate.hamedarezoo900.workers.dev`

Candidate boundaries:

- Worker name fixed to `drkhaleej-web-candidate`;
- `workers.dev` enabled;
- no Production route or custom domain;
- `NEXT_PUBLIC_ENABLE_INDEXING=false`;
- DrKhaleej Preview Supabase identity only;
- Preview publishable key attached as a Worker secret binding;
- no Production Supabase key;
- no service-role key;
- no Production automation authority.

Exact successful candidate run on commit `a77beda3ece3a41ad02711767692a8459ef4d0da` proved:

- `/` -> 308;
- `/en/om` -> 200;
- `/ar/om` -> 200;
- `/admin/login` -> 200;
- auth callback without a code -> 307;
- robots -> 200;
- sitemap -> 200;
- automation API -> expected fail-closed 503;
- callback invalid-input API -> 400 without mutation;
- provider-onboarding invalid-input API -> 400 without mutation;
- Pages hospital API nonexistent lookup -> 404 with `no-store, private`;
- real Vinext Server Action dispatch recognized and blocked by the existing admin auth gate before mutation;
- EN/AR canonical URLs preserved on `https://www.drkhaleej.com`;
- EN/AR hreflang preserved;
- no `workers.dev` hostname leaked into canonical, robots or sitemap output;
- robots keeps `/api/` and `/admin/` blocked and references the canonical sitemap;
- sitemap keeps EN/AR Oman market roots on the canonical domain;
- rendered Next static asset -> 200 and non-HTML;
- controlled load: 20 requests, zero 5xx;
- Worker Tail with error-only observation at 99% sampling: zero invocation-error events;
- final marker: `CANDIDATE_GATE=GREEN`.

The lower-privilege candidate deliberately does not receive `SUPABASE_SERVICE_ROLE_KEY`. Service-role-dependent public happy paths are not exercised by creating fake entities. Preview database read/write safety remains covered by the repository's existing DB/RLS/seed/Preview Migration Sync gates, which are required to stay green on the exact PR head.

## Automation boundary

The Cloudflare Web migration does not activate the long-running polling worker and does not expand Production automation authority. The following contracts remain closed/preserved:

- Preview-only automation boundary;
- Ed25519 service identity;
- maximum JWT TTL 300 seconds;
- JTI replay protection;
- request/body binding and fencing semantics;
- no direct automation-worker database credential;
- denied publish, rollback, public promotion, index promotion and sitemap promotion scopes.

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

A safe GitHub preflight verified presence/identity relationships without printing project refs or secret values:

- Preview project ref: present;
- Production project ref: present;
- Preview and Production refs: distinct;
- Preview database URL: present and matches the Preview project identity;
- Cloudflare account ID/token: present;
- DrKhaleej Preview publishable key: present.

The connected Supabase account available to this migration session does not expose a DrKhaleej project, so Smart Visions project credentials must never be substituted.

Production-only privileged Web secrets are a PR B pre-cutover parity requirement. They must be installed as Cloudflare secrets without being printed, and their service-role-backed paths must be verified without creating junk canonical entities.

## PR A exit state

The following PR A gates are green on the paid isolated candidate:

1. Public pre-cutover DNS/origin/TLS/header/SEO baseline.
2. Vinext check and Cloudflare build.
3. Isolated candidate deploy in the existing paid Cloudflare account.
4. Lower-privilege Preview Supabase identity/parity.
5. EN/AR Oman public runtime smoke.
6. Admin login surface and auth-callback runtime smoke.
7. All five HTTP handler surfaces exercised with non-mutating or fail-closed probes.
8. Real Server Action runtime dispatch with existing auth gate.
9. Static asset, canonical, hreflang, robots and sitemap parity.
10. Bounded cache behavior on the Pages API (`no-store, private`).
11. Controlled load and Worker Tail with zero unexplained 5xx/invocation errors.
12. Existing Preview DB migration/RLS/seed/write-safety workflows remain required on the exact PR head.

PR B remains responsible for the executable DNS rollback refresh, Production Worker secrets/env parity, custom-hostname/routing cutover, authenticated Production admin/session verification, service-role-backed Production path verification without junk data, post-cutover header/cache/SEO comparison, permanent candidate->smoke->Production CI/CD, and final Production smoke.

No Production DNS mutation is permitted until those PR B pre-cutover gates are green and rollback is executable.
