# Public Provider Discovery Architecture

## Problem

Imported provider profiles can become detail-renderable without becoming first-class public catalog entries. Manual providers are discoverable through directory and search queries, while imported providers can have canonical detail pages and sitemap eligibility without the same discovery guarantees.

The SEO risk is an orphan pattern: a profile may be routable and indexable while missing from public directory, global search, related links, or shared listing cards.

## Target invariant

A provider cannot be public-indexed unless it is detail renderable, discoverable in at least one public directory or search path, internally linked from the public graph, sitemap eligible through the same discovery contract, rendered through shared public UI components, and backed by reviewed source evidence.

This invariant applies equally to manual and imported providers.

## Public provider projection

Introduce a single public-safe projection for provider discovery. It may start as a library adapter and later become a database-backed table or materialized view.

Suggested module: `src/lib/catalog/public-provider-projection.ts`.

The projection should expose a `PublicProviderDiscoveryEntry` model with id, source kind, entity type, family, slug, canonical path, localized names and descriptions, Oman location fields, taxonomy arrays, evidence fields, and three booleans: public detail eligible, public discovery eligible, and public sitemap eligible.

All public directory, search, related-link, and sitemap code should consume this projection instead of querying manual centers or import publish queues directly.

## Eligibility levels

Detail eligibility means the profile may return a public 200 page. Discovery eligibility means the profile may appear in listing, search, and internal links. Sitemap eligibility means the profile may enter sitemap and public index.

Sitemap eligibility must be downstream of discovery eligibility. If an imported provider is not discoverable, it must not be in sitemap.

## Unified public catalog API

Add provider-level APIs that merge manual and imported sources: `listPublicProviders`, `searchPublicProviders`, and `getPublicProviderByCanonicalPath`.

Manual provider records win when a manual and imported provider have the same canonical slug or path. Imported duplicates are suppressed from discovery and sitemap. `canonicalPath` is the source of truth for public links. Listing and search cards must not hardcode legacy routes such as `/center/[slug]`.

## Shared public UI

Public provider rendering should converge on shared components for cards, listing grids, search results, and profile shells. Provider components should receive the public provider projection or a detail model derived from it. Links must use `canonicalPath` only.

Cards must not expose unreviewed claims such as ratings, insurance, booking support, phone actions, or availability unless those claims are part of the reviewed public-safe model.

## Internal linking graph

Public publish should build internal links through one helper, such as `buildPublicProviderInternalLinks(entry, relations)`.

Minimum link families include provider detail to family directory, provider detail to area or governorate discovery, provider detail to service or category discovery when evidence exists, related nearby providers when safe relations exist, and directory or search paths back to the provider detail page.

The sitemap gate must fail closed if required discovery or internal-link coverage is missing.

## Bulk publish contract

Single publish and bulk publish must use the same machinery: import raw data, normalize, create or update candidates, dry-run, operator review, publish projection, public smoke check, then discovery and sitemap check.

Bulk dry-run reports should include total candidates, detail eligible count, discovery eligible count, sitemap eligible count, blocked count, duplicate count, missing geo count, missing contact or map count, missing source count, missing taxonomy count, unsupported route count, orphan-risk count, and internal link counts.

Any discovery and sitemap mismatch is a no-go.

## Validator plan

Add a contract validator named `scripts/import/check-public-import-discovery-contract.mjs`.

It should enforce that imported providers enter the public provider projection, directory pages use unified public provider queries, global search uses unified public provider search, listing and search cards link through `canonicalPath`, sitemap reads only discovery-backed sitemap-eligible entries, manual duplicates win over imported duplicates, and cards do not render unsafe claims.

Fixture requirements: one manual hospital, one safe imported hospital, one imported hospital duplicate of the manual slug, one blocked imported hospital missing source evidence, and one noindex imported hospital.

Expected behavior: manual provider is visible, safe imported provider is visible, duplicate imported provider is suppressed, blocked provider is not visible, and noindex provider is excluded from sitemap.

## PR sequence

1. cleanup and architecture doc;
2. public provider projection types;
3. imported provider projection adapter;
4. unified directory query;
5. unified public cards;
6. hospital directory migration;
7. global search migration;
8. sitemap depends on discovery;
9. internal link graph;
10. bulk publish gate.

Runtime implementation should stay incremental. The contract must move first so later PRs cannot silently rebuild parallel public catalogs again.
