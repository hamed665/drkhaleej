# DrMuscat Manual Publish Flow Contract

## PR 11: Manual Publish Flow

Manual publish must only happen after all readiness checks pass.

Manual approval is required before visibility can become public.

Publish flow order is fixed:

```text
Validate readiness
Generate links
Generate schema
Check sitemap eligibility
Check public render budget
Manual approve
Publish
```

Rules:

- Failed publish attempts must return blockers, not partially publish.
- Publish must use the central readiness engine.
- Publish must check sitemap eligibility separately from publish readiness.
- Publish must check the public render performance budget before public visibility.
- Manual approval must be explicit.
- This PR should not add public routes or sitemap XML generation.
