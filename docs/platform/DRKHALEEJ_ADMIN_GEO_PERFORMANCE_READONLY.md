# DrKhaleej Admin Geo and Performance Read-only Panel

## Purpose

This Admin surface exposes a read-only snapshot of Oman geo authority targets and public performance budgets.

## Read-only only

The panel is informational. It does not provide forms, buttons, server actions, or mutation handlers.

## Geo snapshot

The panel displays:

- Oman country code;
- expected governorate count;
- expected wilayat count;
- expected Muscat area count;
- database write readiness as false;
- public geo readiness as false.

## Performance snapshot

The panel reads the existing public performance budget and displays query, TTFB, LCP, INP, CLS, HTML payload, and route JavaScript limits.

## Safety boundary

- No database writes.
- No publish controls.
- No sitemap controls.
- No index toggles.
- No manual bypass.
- No bulk actions.
- No public runtime behavior changes.

The page is an operational visibility surface, not an authorization surface. Apparently dashboards need this stated explicitly because buttons have a habit of breeding when nobody is watching.
