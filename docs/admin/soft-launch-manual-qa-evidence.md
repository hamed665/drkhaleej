# Soft launch manual QA evidence

This document is the operator evidence record required before any sitemap or index expansion.

It is not a runtime workflow. It is a manual QA contract for the first soft-launch pass.

## Required admin checks

Record evidence for:

- `/admin/draft-centers`
- `/admin/draft-centers/[centerId]`
- `/admin/active-centers`
- `/admin/audit-log`

Expected admin evidence:

- draft center remains `pending_review` before activation
- readiness blockers are zero before activation
- activation action re-checks readiness
- audit log includes `draft_center.public_profile_activated`
- active centers view remains read-only
- no edit controls appear after activation

## Required public profile checks

Record evidence for:

- 1 English doctor profile
- 1 Arabic doctor profile
- 1 English center profile
- 1 Arabic center profile
- 1 missing or invalid doctor fallback
- 1 missing or invalid center fallback

Expected public evidence:

- profile-specific summary is visible
- metadata is profile-specific
- invalid fallback remains `noindex,follow` or notFound
- approved contact actions only
- license copy appears only with `licenseInfo`
- relation previews are capped
- medical safety note is visible
- no public rating, review, booking, insurance, open-now, emergency availability, best, top-rated, guaranteed, or MOH approval claims appear

## Required import profile checks

Record evidence for:

- 1 imported doctor profile
- 1 imported pharmacy profile
- 1 imported hospital profile

Expected import evidence:

- imported profile is reviewed
- language is present
- source is present
- taxonomy signal is present
- location is present
- contact or map signal is present
- name-only imported profile remains noindex
- Arabic output is checked where applicable

## Required sitemap checks

Record evidence for `/sitemap.xml`.

Expected sitemap evidence:

- no query URLs
- no filter URLs
- no preview URLs
- no admin URLs
- no provider dashboard URLs
- no native doctor or center bulk expansion
- import entries remain reviewed, `index_eligible`, `index`, and `included`

## Required security check

Record evidence that Supabase Security Advisor Errors are 0 before soft launch.

Warnings may remain only if tracked in the warning backlog contract.

## Pass condition

Soft launch QA passes only when every required section above has evidence and no launch blocker remains.

Do not start native sitemap or index expansion from a partial QA record.
