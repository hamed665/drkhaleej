# Production Hospital Public Hold Incident

A production URL rendered a public hospital profile while imported hospital public release is still blocked.

Observed URL shape:

`/en/om/hospitals/abeer-hospital`

## Expected behavior

All imported hospital public detail URLs must return not found unless the hospital hold contract is explicitly retired.

## Immediate hardening

The hospital public hold route must remain fail-closed and must also opt out of static caching while the hold is active:

- `dynamic = "force-dynamic"`
- `revalidate = 0`
- route body calls `notFound()`
- metadata remains noindex/unavailable

## Public release exception

Only manually approved hospital pages may be released through a separate allowlisted implementation. Imported hospital rows must not become public through this route.
