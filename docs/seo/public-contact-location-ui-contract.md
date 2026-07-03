# Public contact and location UI contract

The public center contact and location experience is a UI presentation layer only.

It may show:

- reviewed hero contact actions already produced by the public contact action builder
- public branch labels
- public area, city, and country text
- primary branch styling
- safe public map directions links when a reviewed map URL exists
- a conservative fallback note when reviewed contact actions are unavailable

It must not show:

- unreviewed contact values
- duplicated provider contact actions inside location cards
- booking claims
- opening status claims
- ratings or review counts
- insurance claims
- official regulator approval claims
- emergency availability claims

Location cards must keep direction links external-safe with `noopener noreferrer`.

This contract does not change provider data, contact visibility rules, profile indexing, sitemap eligibility, metadata, schema, import workflows, or media workflows.
