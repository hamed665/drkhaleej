# First Observation Report

Use this report immediately after the first controlled provider rollout.

This report is a manual evidence record. It does not change database state, revalidate routes, alter sitemap entries, or approve any additional provider rollout.

## Provider identity

- Center id:
- Slug:
- English name:
- Arabic name:
- Center type:
- Operator:
- Observation date:

## Action result

- Final gated control used: yes / no
- Server action result:
- Admin message shown:
- Any retry attempted: yes / no
- Retry reason:

If the first attempt fails, do not retry blindly. Re-check readiness evidence, location, taxonomy, quality, contact visibility, and public copy.

## Admin state after rollout

Record the observed admin state:

- Provider absent from `/admin/draft-centers`: yes / no
- Provider present in `/admin/active-centers`: yes / no
- Active centers view remains read-only: yes / no
- No active-provider edit controls visible: yes / no
- Current status:
- Current `is_active` value:
- Current `is_claimable` value:

## Audit evidence

Record the audit evidence:

- `/admin/audit-log` loads: yes / no
- Audit action found: yes / no
- Expected action: `draft_center.public_profile_activated`
- Audit entity type:
- Audit entity id:
- Audit public English path:
- Audit public Arabic path:
- Sitemap refresh evidence:
- Audit notes:

## Public route checks

Record public route behavior:

- English public route:
- English route result:
- Arabic public route:
- Arabic route result:
- Public listing result:
- Public search result:
- Safe fallback shown when contact actions are absent: yes / no / not applicable
- Medical safety note visible: yes / no
- Directions links safe: yes / no / not applicable

Public route loading must still depend on the public eligibility wrapper.

## Public claim checks

Confirm none of these claims appear:

- best or top provider
- rating or review score
- open-now availability
- booking availability
- insurance acceptance
- unsupported MOH approval
- guaranteed provider availability
- sponsored ranking
- medical advice, diagnosis, or emergency guidance

Unsupported public claim found: yes / no

If yes, record the claim and stop further rollout:

## Sitemap and indexability checks

- Sitemap revalidation expected: yes / no
- Sitemap behavior observed:
- Manual sitemap edit performed: must be no
- Public detail route still eligibility-gated: yes / no
- Import sitemap guards bypassed: must be no

## Decision

- Observation passed: yes / no
- Continue to next candidate later: yes / no
- Stop and investigate: yes / no
- Reason:

Passing this observation report does not approve bulk rollout. It only confirms the first controlled rollout behaved as expected.
