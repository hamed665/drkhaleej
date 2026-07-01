# Launch readiness checkpoint

This checkpoint records the final pause before any public expansion work.

It is a release note and validation target, not a runtime workflow.

## Default state

Default state is pending.

Expansion stays paused until all required evidence has been recorded and reviewed.

## Required evidence

The release checkpoint requires:

- manual QA evidence is complete
- admin route evidence is complete
- public profile evidence is complete
- import profile evidence is complete
- sitemap evidence is complete
- platform advisor blockers are zero
- remaining platform advisor notes are tracked in the backlog
- native doctor and center entries are not expanded in `src/app/sitemap.ts`
- profile promotion contract remains helper-only until a later wiring PR

## Stop conditions

Any of these keeps expansion paused:

- missing manual evidence
- missing admin evidence
- missing public profile evidence
- missing import profile evidence
- missing sitemap evidence
- platform advisor blockers above zero
- untracked platform advisor notes
- native profile expansion before approval
- unsupported public claims in profile UI or metadata

## Allowed after approval

Only after this checkpoint is approved may a separate PR start limited wiring for native profile promotion.

That later PR must keep family caps, deterministic ordering, eligibility checks, completeness acceptance, reviewed evidence, and safe canonical paths.

## Not approved here

This checkpoint does not approve:

- bulk profile sitemap expansion
- GEO growth
- ranking pages
- user feedback schema
- appointment schema
- plan or payment claims
- provider self-editing public copy
- public claim workflow launch
- sponsored ranking

## Operator note

A green CI run is not the same as approval.

CI proves the checkpoint exists. The operator still must record real evidence before expansion starts.
