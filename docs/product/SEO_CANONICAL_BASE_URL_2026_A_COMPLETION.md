# SEO Canonical Base URL 2026-A Completion

## 1. Problem summary

Homepage metadata could emit canonical, Open Graph, and hreflang alternate URLs using `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` was missing or invalid during a production or preview build.

That is unsafe for SEO because canonical and `og:url` values must point to the production DrMuscat domain, not a local development host.

## 2. Root cause

`src/lib/seo/site.ts` used `http://localhost:3000` as the only fallback for `siteConfig.baseUrl`. Because `src/lib/seo/metadata.ts` builds canonical URLs, language alternates, and Open Graph URLs from `siteConfig.baseUrl`, a missing or malformed public app URL could leak localhost into production metadata.

## 3. Production base URL decision

The production-safe fallback canonical base URL is:

```txt
https://drmuscat.com
```

Production and preview builds now resolve metadata URLs to `https://drmuscat.com` unless a valid `NEXT_PUBLIC_APP_URL` is explicitly provided.

Expected canonical results:

```txt
https://drmuscat.com/en/om
https://drmuscat.com/ar/om
```

Open Graph `url` matches the canonical URL, and hreflang alternates use the same production-safe base.

## 4. Env var recommendation

Vercel should set the following environment variable for production deployments:

```txt
NEXT_PUBLIC_APP_URL=https://drmuscat.com
```

The code still has a safe production fallback if this environment variable is missing or invalid.

## 5. Local development behavior

Local development can still fall back to:

```txt
http://localhost:3000
```

This localhost fallback is only used when `NODE_ENV === 'development'` and no valid `NEXT_PUBLIC_APP_URL` is provided.

## 6. Files changed

- `src/lib/seo/site.ts`
- `docs/product/SEO_CANONICAL_BASE_URL_2026_A_COMPLETION.md`

## 7. Validation results

Validation commands completed for this PR:

- `git status --short` — showed only the two intended changed files before commit.
- `pnpm lint` — passed with existing warnings only.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- `pnpm seo:check` — passed.
- Manual metadata QA with `NODE_ENV=production` and no `NEXT_PUBLIC_APP_URL` — confirmed `/en/om` and `/ar/om` canonical, Open Graph URL, and hreflang alternates use `https://drmuscat.com`.
- Manual metadata QA with `NODE_ENV=production` and invalid `NEXT_PUBLIC_APP_URL` — confirmed fallback remains `https://drmuscat.com`.
- Manual metadata QA with `NODE_ENV=development` and no `NEXT_PUBLIC_APP_URL` — confirmed local fallback remains `http://localhost:3000`.

Manual metadata expectations:

- `/en/om` canonical: `https://drmuscat.com/en/om`
- `/ar/om` canonical: `https://drmuscat.com/ar/om`
- Open Graph URL: matches the canonical URL
- hreflang alternates: use `https://drmuscat.com`
- production metadata: does not fall back to `localhost:3000`

## 8. Scope confirmation

This PR does not change:

- UI
- routing
- root redirect behavior
- schema or JSON-LD
- database files
- Supabase files
- RLS policies
- migrations
- API routes
- sitemap files
- robots files
- `llms.txt`
- package files
- lockfile

## 9. Next PR recommendation

Recommended next PR:

```txt
UI-K-BRAND-2026-A — Clean SVG/Raster Logo Asset Foundation
```
