# DrMuscat Geo Routes Contract V1

## Purpose

Define the future Oman geo route contract before runtime pages are built.

This keeps route generation predictable and prevents accidental URL drift when the static geo registry expands.

## Current command

```bash
pnpm geo:routes:contract
```

The command validates that the static geo registry can produce a stable route contract.

## Route prefix

All Oman geo discovery routes must live under:

```text
/oman
```

## Planned route levels

```text
/oman
/oman/:governorate
/oman/:governorate/:wilayat
/oman/:governorate/:wilayat/:area
```

## Examples

```text
/oman/muscat
/oman/muscat/bawshar
/oman/muscat/bawshar/al-khuwair
/oman/dhofar/salalah
/oman/dhofar/salalah/salalah
```

## Validation rules

The route contract validator checks:

- every route starts with `/oman`
- route paths are lowercase
- route paths do not contain duplicate slashes
- slugs use lowercase kebab-case
- governorate route paths are unique
- wilayat route paths are unique within their governorate
- area route paths are unique within their governorate and wilayat
- wilayats reference existing governorates
- areas reference existing governorates and wilayats

## Canonical source

The canonical source remains:

```text
src/config/geo/oman.ts
```

The route contract is derived from this static geo registry.

## Explicit non-goals

- No runtime pages
- No app router changes
- No dynamic route files
- No database migrations
- No provider data
- No sitemap changes
- No metadata or JSON-LD changes
- No generated route manifest committed

## Follow-up phases

- Add static route helpers only after this contract is stable.
- Add runtime route shells in a later approved PR.
- Add SEO metadata and structured data after runtime route behavior is reviewed.
