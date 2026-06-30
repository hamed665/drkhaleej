# Go / No-Go Decision Record

Use this record immediately before the first real provider activation.

This record is a final manual decision checkpoint. It does not change database state, revalidate routes, alter sitemap entries, or approve any later provider rollout.

## Candidate identity

- Center id:
- Slug:
- English name:
- Arabic name:
- Center type:
- Decision owner:
- Decision date:

## Required source documents

Confirm these documents are complete and reviewed:

- Candidate selection worksheet: pass / fail
- First provider rehearsal: pass / fail
- Soft launch operator checklist: pass / fail
- Readiness bundle reviewed: yes / no
- First observation report prepared for later use: yes / no

## Candidate readiness summary

- Workflow status is `pending_review`: yes / no
- `is_active` is false: yes / no
- `is_claimable` is false: yes / no
- Active location exists: yes / no
- Primary taxonomy is approved: yes / no
- Quality blocker count is zero: yes / no
- Contact visibility is reviewed: yes / no
- Public copy is launch-safe: yes / no

## Risk notes

Record any remaining risks:

- Location risk:
- Taxonomy risk:
- Contact risk:
- Public copy risk:
- Audit risk:
- Sitemap or indexability risk:
- Operator risk:

If any risk is material, the decision must be no-go.

## Rollback and removal readiness

Before choosing go, confirm the team knows the rollback boundary:

- Activation is not a rollback workflow: yes / no
- Deactivation or unpublish must be separate: yes / no
- No manual database rollback is approved here: yes / no
- No manual sitemap edit is approved here: yes / no
- Stop condition owner identified: yes / no

## Final decision

Choose exactly one:

- Go
- No-Go

Decision reason:

Required approver:

Approval timestamp:

## Post-decision rules

If the decision is Go:

- use only the final gated admin control
- do not make manual database edits
- do not manually change sitemap entries
- complete the first observation report immediately after activation

If the decision is No-Go:

- do not use the final gated admin control
- record the blocker
- fix the blocker through a separate small PR or admin review step
- repeat the candidate worksheet and rehearsal before reconsidering

This record does not approve bulk rollout. It only approves or blocks one controlled provider activation.
