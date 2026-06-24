# DrMuscat Country Adapter Foundation V1

## Purpose

Add a country adapter foundation before adding any new country.

The adapter defines country-level routing, geo levels, metadata policy, publication policy, and schema policy.

## Current state

```text
Only Oman is active
All other internal countries are disabled drafts
```

## Source files

```text
src/config/geo/country-adapter-contract.ts
src/lib/geo/country-adapters.ts
scripts/validate-country-adapters.mjs
```

## Oman adapter

```text
countryCode: om
countrySlug: oman
routeNamespace: oman
status: active
geoLevels: governorate, wilayat, area
metadataPolicy: noindex-first
publicationPolicy: gated
schemaPolicy: disabled-until-approved
```

## Disabled country drafts

GCC drafts:

```text
ae
qa
sa
kw
bh
```

North America and UK drafts:

```text
Canada: ca - province, city, area
United States: us - state, city, area
United Kingdom: gb - nation, city, area
```

Other internal drafts remain disabled too.

These are not public-enabled by this foundation.

## Safety rules

```text
No non-Oman country becomes public
No non-Oman route is created
No sitemap entry is created
No JSON-LD is generated
No index promotion is enabled
No LLM surface is enabled
```

## Next step

```text
Prompt 35 - Country Adapter Oman Migration
```

Prompt 35 should move existing Oman geo behavior behind the adapter without changing public behavior.
