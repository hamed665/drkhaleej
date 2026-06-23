# Taxonomy Export

Run:

```bash
pnpm taxonomy:export
```

This command exports the static taxonomy configuration into:

```text
data/seo/taxonomy-registry.json
```

The export includes registry arrays and summary counts. It does not read Supabase, provider records, reviews, ratings, or private data.
