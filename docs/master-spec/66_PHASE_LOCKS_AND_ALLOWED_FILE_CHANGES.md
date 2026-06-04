# 66_PHASE_LOCKS_AND_ALLOWED_FILE_CHANGES.md — Phase Locks and Allowed File Changes

**Package:** DrMuscat Master Spec V10.4 Agent-Safe Build Framework  
**Status:** Canonical build-control document  
**Applies to:** Codex, Claude Code, or any coding agent building DrMuscat from zero or modifying the repository.

> This document is not a product feature spec. It is an execution-control contract. If a coding agent cannot follow it, the agent must stop instead of guessing.

## 1. Purpose
This file prevents agent drift by defining what each phase may and may not touch.

## 2. General Rules
- A phase may only edit files listed as allowed for that phase.
- If another file must be edited, stop and request approval.
- Do not implement future-phase features early.
- Do not change public route contracts outside SEO phases unless explicitly approved.

## 3. Phase 0 — Repository Readiness
Allowed:
- Read-only inspection
- `README.md` planning draft if repo is empty
- No product implementation

Forbidden:
- Database migrations
- Public pages
- Admin pages
- Payment code

## 4. Phase 1 — App Foundation
Allowed:
```txt
package.json
pnpm-lock.yaml/package-lock.json
next.config.*
tsconfig.json
eslint.config.*
tailwind.config.*
postcss.config.*
.env.example
src/app/layout.tsx
src/app/[locale]/[country]/page.tsx
src/middleware.ts
src/lib/i18n/**
src/lib/routes/**
src/lib/seo/**
src/components/ui/**
src/components/layout/**
src/styles/**
```
Forbidden:
```txt
supabase/migrations/**
supabase/seed/**
payment/**
provider dashboard
admin business logic
appointment booking
ads wallet
```

## 5. Phase 2 — Database Core
Allowed:
```txt
supabase/migrations/**
supabase/seed/**
src/lib/db/**
src/server/db/**
.env.example
scripts/db-*.ts
```
Forbidden:
```txt
Public UI pages except minimal generated DB types integration
Payment gateway integration
Admin dashboard UI
```

## 6. Phase 3 — RLS and Security
Allowed:
```txt
supabase/migrations/*rls*.sql
supabase/migrations/*policies*.sql
src/server/auth/**
src/lib/auth/**
src/middleware.ts
scripts/validate-rls.*
```
Forbidden:
- Feature UI expansion
- Sponsored ranking logic
- Payment gateway code

## 7. Phase 4 — Public SEO Pages
Allowed:
```txt
src/app/[locale]/[country]/centers/**
src/app/[locale]/[country]/center/**
src/app/[locale]/[country]/doctors/**
src/app/[locale]/[country]/areas/**
src/components/public/**
src/components/medical/**
src/lib/seo/**
src/lib/schema/**
src/lib/search/**
src/app/sitemap.ts
src/app/robots.ts
public/llms.txt or src/app/llms.txt
```
Forbidden:
- Provider billing
- Live appointment booking
- Web push
- AI chat

## 8. Phase 5 — Admin Basic
Allowed:
```txt
src/app/admin/**
src/components/admin/**
src/server/admin/**
src/lib/permissions/**
supabase/migrations/*admin*.sql
```
Forbidden:
- Payment gateway live integration
- Advanced analytics
- Full provider dashboard

## 9. Phase 6 — Claim and Provider Ownership
Allowed:
```txt
src/app/[locale]/[country]/claim/**
src/app/provider/**
src/server/claims/**
supabase/migrations/*claims*.sql
src/components/claim/**
```
Forbidden:
- Plan billing enforcement beyond ownership access
- Live payment gateway

## 10. Phase 7 — Provider Dashboard
Allowed:
```txt
src/app/provider/**
src/components/provider/**
src/server/provider/**
src/lib/entitlements/**
```
Forbidden:
- Public route restructuring
- Live payment gateway
- AI chat

## 11. Phase 8 — Offers, Click Tracking, Sponsored Foundation
Allowed:
```txt
src/server/events/**
src/server/offers/**
src/server/sponsored/**
src/components/sponsored/**
supabase/migrations/*offers*.sql
supabase/migrations/*events*.sql
supabase/migrations/*sponsored*.sql
```
Forbidden:
- Hidden organic ranking boosts
- Full CPC wallet unless later approved

## 12. Phase 9 — Plans and Manual Billing
Allowed:
```txt
src/app/admin/billing/**
src/app/provider/billing/**
src/server/billing/**
supabase/migrations/*billing*.sql
supabase/migrations/*plans*.sql
```
Forbidden:
- Live gateway integration unless explicitly approved
- Storing card data

## 13. Phase 10 — SEO Ops, Redirects, Import, Duplicate Tools
Allowed:
```txt
src/app/admin/seo/**
src/app/admin/imports/**
src/app/admin/data-quality/**
src/server/imports/**
src/server/seo/**
scripts/import-*.ts
scripts/validate-seo.ts
supabase/migrations/*redirect*.sql
supabase/migrations/*import*.sql
```

## 14. Phase 11 — QA and Production Hardening
Allowed:
```txt
.github/workflows/**
tests/**
scripts/validate-*.ts
src/lib/monitoring/**
src/app/api/health/**
```
Forbidden:
- Adding new product scope except bug fixes

## 15. Violation Rule
If a phase requires changes outside allowed files, stop and create a `SCOPE_EXTENSION_REQUEST`.

## UI-K-ROUTE-CONTRACT-A — Public UI Route Contract Allowance

This route-contract phase explicitly allows updating route-contract and documentation files so later frontend-only UI phases may create the following exact public route families without broad wildcard allowance:

```txt
src/app/[locale]/[country]/articles/page.tsx
src/app/[locale]/[country]/articles/[slug]/page.tsx
src/app/[locale]/[country]/sign-in/page.tsx
src/app/[locale]/[country]/register/page.tsx
src/app/[locale]/[country]/list-your-center/page.tsx
src/app/[locale]/[country]/for-providers/page.tsx
```

This allowance is route-contract-only. It does not implement pages, UI, backend APIs, auth backend, dashboards, payment logic, database schema, migrations, generated types, seed data, Supabase access, or RLS policies. It does not authorize sitemap, robots, or `llms.txt` changes. Future page implementation must remain frontend-only unless a later task explicitly approves backend/auth/payment/database scope. Article pages must include medical disclaimers and must not make diagnosis, treatment, fake rating, fake review, or unsupported medical claims.
