# DrMuscat Oman Geo Evidence Registry V1

## Purpose

Add a central evidence registry structure for Oman geo pages.

The registry is disabled and empty in this phase. It defines where future reviewed evidence can live, but it does not approve evidence and does not make any page indexable.

## Contract source

```text
src/config/geo/evidence-registry-contract.ts
```

## Runtime source

```text
src/lib/geo/oman-evidence-registry.ts
```

## Validation command

```bash
pnpm geo:evidence-registry:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

## Entity coverage

```text
governorate
wilayat
area
```

## Evidence kinds

```text
provider-inventory
editorial-content
qa-evidence
promotion-review
```

## Current registry state

```text
registryEnabled: false
entries: []
totalEntries: 0
approvedEntries: 0
humanReviewedEntries: 0
promotionAllowed: false
```

## Guardrails

```text
noindexRemovalAllowed: false
sitemapPromotionAllowed: false
jsonLdAllowed: false
indexPromotionAllowed: false
```

## Runtime helpers

```text
listOmanGeoEvidenceRegistryEntries()
listOmanGeoEvidenceRegistryEntityContracts()
getOmanGeoEvidenceRegistryEntityContract(entity)
listOmanGeoEvidenceRegistryEntriesForEntity(input)
getOmanGeoEvidenceRegistryRuntimeState()
```

## Safety guarantees

- No evidence entry is approved
- No route becomes indexable
- No noindex guardrail is removed
- No sitemap inclusion is added
- No JSON-LD is generated
- No provider query is added
- No editorial query is added
- No generated JSON is committed

## Future implementation gate

A later approved PR may add reviewed evidence entries only after the evidence source, reviewer role, review date, and entity scope are documented.
