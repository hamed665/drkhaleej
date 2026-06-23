# DrMuscat Geo CI Guardrails V1

## Purpose

Ensure Oman geo registry and geo route guardrails are enforced in CI before future geo changes can merge.

Geo data and route contracts now affect runtime behavior, metadata, and future SEO architecture. They must be validated automatically, not manually remembered like some tragic sticky note on a monitor.

## CI command

```bash
pnpm geo:check:oman
```

This command runs:

```bash
pnpm geo:validate:oman
pnpm geo:routes:validate
```

## CI workflow integration

The main DrMuscat CI workflow runs the Oman geo guardrail step after the Iran geo import contract check and before the SEO market gate.

```text
Validate Oman geo guardrails
```

## What is enforced

The Oman geo guardrails validate:

- Oman governorates, wilayats, and area registry integrity
- Route contract status
- Runtime route scaffold requirements
- Metadata noindex guardrails
- Disabled sitemap behavior
- Disabled JSON-LD behavior
- No accidental provider or database behavior in the route contract

## Explicit non-goals

- No runtime route changes
- No metadata policy changes
- No sitemap generation
- No JSON-LD generation
- No provider queries
- No database migrations
- No generated JSON committed

## Follow-up phases

Future geo route PRs must keep this CI gate passing before merge.
