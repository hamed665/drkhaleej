# Cloudflare Web Production Cutover Runbook

Scope: DrKhaleej Website only (`hamed665/drkhaleej`).

Canonical Production origin after cutover: `https://www.drkhaleej.com`.

## Non-negotiable boundaries

- No Smart Visions repository, project, key or Supabase identity may be used.
- No Supabase schema, RLS or data mutation is part of this hosting migration.
- Production automation stays fail-closed. The Web cutover does not activate the Agent runtime.
- No callback/provider happy-path writes or junk Production records are used for QA.
- Vercel remains alive as rollback capacity until the post-cutover stabilization window is explicitly closed.
- Candidate/stage `workers.dev` URLs never become canonical/index authorities.
- Production DNS is not changed by push workflows.

## Required GitHub Actions secrets

The cutover runner consumes the existing Cloudflare/account/project-ref secrets plus these DrKhaleej Production Supabase secrets:

- `PRODUCTION_SUPABASE_ANON_KEY`
- `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY`

Values are never printed by the runner. The service-role value is not present in the Vinext build environment; it is installed only as a Worker secret binding.

## Gates

### 1. Read-only preflight

`scripts/cloudflare/production-preflight.mjs` must be green immediately before staging/cutover. It proves:

- Preview and Production Supabase refs are distinct.
- The active `drkhaleej.com` Cloudflare zone belongs to the expected account.
- The current `www` CNAME still matches the recorded Vercel rollback baseline.
- The Production public Supabase key belongs to the Production project.
- The Production service-role key can perform the approved read-only REST proof.

### 2. Isolated Production-backed stage

Manual workflow: `Cloudflare Production Stage and Cutover`, mode `stage`.

It deploys the single final Worker name `drkhaleej-web-production` to `workers.dev` only, with:

- Production Supabase URL/public key.
- Production service role as a Worker secret.
- `NEXT_PUBLIC_ENABLE_INDEXING=false`.
- Production canonical URL preserved as `https://www.drkhaleej.com`.
- Production automation explicitly fail-closed.
- No Production custom domain or DNS mutation.

The stage smoke verifies EN/AR pages, admin login, auth callback no-code behavior, invalid-input public APIs, read-only service-role-backed Pages API behavior, the dedicated non-mutating Server Action auth boundary, canonical/hreflang, robots, sitemap, static asset MIME, Worker Tail, and bounded load.

### 3. Production cutover

Manual workflow: `Cloudflare Production Stage and Cutover`, mode `cutover`.

Cutover is refused outside `main`.

The same run first repeats the complete isolated Production-backed stage. Then it:

1. Rebuilds the same Worker with indexing enabled.
2. Disables `workers.dev` before attaching Production hostnames.
3. Re-reads exact apex/www DNS and rejects drift.
4. Requires exactly two apex A records and exactly one known Vercel `www` CNAME.
5. Snapshots the exact DNS fields required for restoration.
6. Re-checks that neither target hostname is already attached as a Worker Custom Domain.
7. Deletes the conflicting Vercel apex/www DNS records only after the snapshot exists.
8. Attaches both `www.drkhaleej.com` and `drkhaleej.com` to the same Worker as Cloudflare Custom Domains.
9. Waits for the canonical Production hostname to become ready.
10. Runs the full Production-domain smoke.
11. Requires apex -> www 308 preservation of path/query.
12. Rejects any remaining Vercel origin headers.
13. Rejects Production `noindex`.
14. Re-runs Worker Tail and bounded load.
15. Verifies both Custom Domains are attached to `drkhaleej-web-production`.

## Automatic rollback

Once the first DNS mutation starts, any later failure triggers rollback in the same process:

1. Detach only target Custom Domains attached to `drkhaleej-web-production`.
2. Remove current apex/www records created during the failed cutover.
3. Recreate the snapshotted Vercel DNS records.
4. Verify the canonical `www` page resolves through Vercel again.
5. Verify the apex redirect to the canonical host is restored.

A rollback verification failure is surfaced as a hard failure and is never hidden by the original cutover error.

## Post-cutover evidence required before declaring migration complete

- `https://drkhaleej.com/...` -> exact canonical `https://www.drkhaleej.com/...` 308.
- `/en/om` and `/ar/om` return 200.
- Admin login and auth callback behavior are preserved.
- Invalid callback/provider requests remain non-mutating and rejected.
- Automation remains exact fail-closed 503 with `automation_preview_boundary_closed`.
- Canonical and all required hreflang values remain exact.
- robots sensitive-path blocks and canonical sitemap remain exact.
- Sitemap contains canonical-domain-only URLs.
- Static JS/CSS MIME is correct.
- Production is not `noindex`.
- Responses no longer identify Vercel as the active origin.
- Worker Tail sees zero invocation errors during the controlled load.
- Controlled load has zero unexplained 5xx.
- Both apex and www are attached to the single Production Worker.
- Vercel is retained temporarily for rollback; it is not deleted as part of cutover.
