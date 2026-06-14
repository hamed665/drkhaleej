# SEC-A — React Server Components dependency/security audit

Date: 2026-06-14
Mode: PHASED_BUILD_ONLY

## Phase mapping

- Execution Phase: Production hardening / dependency security audit
- Lock Scope: Documentation-only security audit note, with package files inspected
- Product Module: Platform dependency/security baseline
- Subphase ID: PROD-SEC-A

## Scope

This audit reviewed the repository dependency state after PR #203 was merged and PR #201/#202 were closed as superseded. It specifically checks whether stale/draft Vercel React Server Components security PRs #140 and #141 should be merged, replaced, or closed as superseded.

No product features, routes, UI, migrations, RLS policies, admin/provider/dashboard/billing/AI/SEO pages, or seed data were changed.

## Files inspected

- `package.json`
- `pnpm-lock.yaml`

## Dependency findings

`package.json` currently declares:

- `next`: `16.2.7`
- `react`: `19.2.0`
- `react-dom`: `19.2.0`

`package.json` does not directly declare any of the following React Server Components packages:

- `react-server-dom-webpack`
- `react-server-dom-turbopack`
- `react-server-dom-parcel`

`pnpm-lock.yaml` currently resolves:

- `next`: `16.2.7(@babel/core@7.29.7)(react-dom@19.2.0(react@19.2.0))(react@19.2.0)`
- `react`: `19.2.0`
- `react-dom`: `19.2.0(react@19.2.0)`

The lockfile search found no resolved entries for:

- `react-server-dom-webpack`
- `react-server-dom-turbopack`
- `react-server-dom-parcel`

## RSC CVE assessment

The stale Vercel PRs #140 and #141 target older Next.js versions and should not be blindly merged into the current dependency baseline.

Current main resolves `next` to `16.2.7`. The stale Vercel PRs #140 and #141 target older `16.0.x` dependency changes and should not be merged blindly into the current dependency baseline.

No standalone `react-server-dom-webpack`, `react-server-dom-turbopack`, or `react-server-dom-parcel` entries were found in `pnpm-lock.yaml`. Because those standalone RSC package entries are absent from the lockfile, this audit does not require package changes based on the local dependency files reviewed.

`pnpm audit --prod --json` returned HTTP 403 in this environment, so npm audit could not be used as confirming evidence for this audit.

## Recommendation

Do not merge PR #140 or PR #141. Close them only after this audit note is merged, or after a separate dependency PR if a later official advisory requires one.

No replacement dependency PR is needed from this audit unless a future advisory specifically requires a newer `next`, `react`, `react-dom`, or standalone `react-server-dom-*` version.

## Limitations

This conclusion is based on `package.json`, `pnpm-lock.yaml`, local validation commands, and manual advisory review. It is not based on a successful npm audit run, because `pnpm audit --prod --json` returned HTTP 403 in this environment.

## Validation notes

Required validation for this SEC-A audit:

- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`
- `pnpm routes:check`

An additional informational `pnpm audit --prod --json` attempt was made during audit triage, but the npm audit endpoint returned HTTP 403 in this environment. This was not part of the required validation gate, could not be used as confirming evidence, and did not change the lockfile conclusion above.
