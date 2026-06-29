# Public catalog eligibility guard

The public center catalog routes must use the eligibility wrapper instead of the raw catalog query module.

## Guarded route family

- `/centers`
- `/labs`
- `/hospitals`
- `/pharmacies`
- `/center/{slug}`

## Validator

Run:

```bash
pnpm seo:public-catalog-eligibility:validate
```

The validator checks that guarded center routes import `@/lib/catalog/public-eligible-queries` and do not import `@/lib/catalog/public-queries` directly.

It also checks that the eligibility wrapper still contains the required active, status, deleted, and verification predicates.
