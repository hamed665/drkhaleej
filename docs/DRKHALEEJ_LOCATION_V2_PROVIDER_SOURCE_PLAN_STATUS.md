# DrKhaleej Location V2 Provider Source Plan Status

This note records the current provider source plan state for Location V2 candidate pages.

## Current status

The provider source plan is contract-only and fail-closed.

It defines allowed planning source types for future provider data work, but it does not import data, collect runtime data, read the database, create routes, emit sitemap entries, emit JSON-LD, add internal SEO links, or promote anything to indexable.

## Merged guard chain

The current chain includes:

- provider source plan contract
- typecheck guard for the contract-level disabled switches
- disabled runtime accessor
- runtime test coverage for all nine candidate policy pairs
- route snapshot guard coverage for registry, sitemap, metadata, runtime, and runtime test tokens

## Required boundary

Future provider data work must keep this chain fail-closed until a separate explicit promotion PR adds data evidence, source review, import readiness, route review, and final gate coverage.

No candidate location/category/service/specialty page may become public, sitemap-included, JSON-LD-enabled, internally linked for SEO, or indexable from this chain alone.
