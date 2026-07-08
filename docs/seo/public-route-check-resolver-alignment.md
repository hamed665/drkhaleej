# Public Route Check Resolver Alignment

Status: routes check alignment note.
Scope: validation only.

## Purpose

Public provider route validation must align with the canonical provider route resolver.

The route checker must not force fake route directories just to satisfy older route assumptions, and it must not fail solely because a held hospital scaffold exists.

## Current source of truth

The canonical public provider route resolver owns public detail route enablement.

Allowed enabled families today:

```text
doctor
center
```

Held or disabled families must resolve to:

```text
canonicalPath: null
publicRouteEnabled: false
reason: route_disabled
```

This includes:

```text
hospital
clinic
pharmacy
lab
imaging_center
beauty_clinic
pet_clinic
pet_shop
```

## Route check policy

Routes check must verify:

```text
raw singular /hospital directory does not exist
raw singular /clinic directory does not exist
raw plural /clinics directory does not exist
canonical resolver exists
resolver knows hospital and clinic families
resolver keeps hospital and clinic route_disabled
```

A held hospital scaffold is not release approval.

## Non-goals

This alignment does not add or change:

- public routes
- sitemap output
- hreflang output
- hospital release
- page rendering
- import behavior
