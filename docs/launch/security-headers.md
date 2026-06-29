# Launch security headers

This launch hardening step adds baseline HTTP response headers through `next.config.ts`.

## Enabled headers

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` with camera, microphone, payment, USB, Bluetooth, and serial disabled by default
- `Cross-Origin-Opener-Policy: same-origin-allow-popups`

## Intentional exclusions

A strict Content Security Policy is not enabled in this step. The public app still uses framework-managed scripts, JSON-LD, analytics/provider surfaces, and Vercel preview behavior that need a separate CSP audit before enforcement.

Add CSP in report-only mode first, then promote to enforcement after route-level verification.
