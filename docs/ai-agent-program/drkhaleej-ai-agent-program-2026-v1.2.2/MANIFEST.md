# Package Manifest

## Control documents

- `README_FA.md`
- `VERSION.md`
- `CHANGELOG.md`
- `MANIFEST.md`
- `00_MASTER_EXECUTION_PLAN_FA.md`
- `01_CURRENT_BASELINE_AND_ALIGNMENT.md`
- `14_ARCHITECTURE_DECISIONS_AND_PREREQUISITES.md`
- `15_IMPLEMENTATION_PLAYBOOK.md`
- `16_PROBLEM_RESOLUTION_REGISTER.md`
- `17_COMPLIANCE_SOURCE_GOVERNANCE.md`
- `18_CONTRACT_INVARIANTS_AND_VERSIONING.md`

## Architecture and product documents

- `02_SYSTEM_ARCHITECTURE.md`
- `03_ENTITY_TAXONOMY_AND_POLICIES.md`
- `04_ENTITY_AGENT.md`
- `05_CONTENT_SEO_AGENT.md`
- `06_DATA_API_CONTRACTS.md`
- `07_PR_BACKLOG.md`
- `08_TEST_AND_ACCEPTANCE_MATRIX.md`
- `09_MONITORING_COST_REPORTING.md`
- `10_SECURITY_THREAT_MODEL.md`
- `11_ADMIN_UX_AND_STATE_MACHINES.md`
- `12_OPERATIONS_RUNBOOK.md`
- `13_TIMELINE_TEAM_AND_DELIVERY.md`

## GitHub execution drafts

- `github/ALIGN_CURRENT_STATE_PR_DRAFT.md`
- `github/ISSUE_934_UPDATED_DRAFT.md`
- `github/IMMEDIATE_EXECUTION_CHECKLIST.md`
- `github/POST_P09_GO_NO_GO_CHECKLIST.md`
- `github/PR_TEMPLATE.md`
- `github/BRANCH_PROTECTION_AND_REVIEW_POLICY.md`

## Repository proposals

- `repo-proposals/import-readiness-roadmap-after-933.PROPOSED.md`
- `repo-proposals/CURRENT_STATE_REQUIRED_UPDATES.md`
- `repo-proposals/V10_4_ALIGNMENT_REQUIRED_UPDATES.md`
- `repo-proposals/IMPORT_READINESS_ALIGNMENT_GUARD_SPEC.md`

## Versioned proposed contracts

- `contracts/README.md`
- `contracts/entity-draft.schema.json`
- `contracts/entity-review-decision.schema.json`
- `contracts/article-draft.schema.json`
- `contracts/article-review-decision.schema.json`
- `contracts/automation-job.schema.json`
- `contracts/service-identity-claims.schema.json`
- `contracts/source-policy.schema.json`
- `contracts/source-observation.schema.json`
- `contracts/persian-report.schema.json`
- `scripts/validate-package.mjs`
- `package.json`
- `package-lock.json`
- `examples/automation.env.example`

## Contract test vectors

- `examples/contracts/entity-draft.valid.json`
- `examples/contracts/entity-integer-scalar.valid.json`
- `examples/contracts/entity-draft.agent-approval.invalid.json`
- `examples/contracts/entity-duplicate-field-path.invalid.json`
- `examples/contracts/entity-unsupported-family.invalid.json`
- `examples/contracts/entity-resolved-conflict.invalid.json`
- `examples/contracts/entity-oversized-string.invalid.json`
- `examples/contracts/entity-oversized-object.invalid.json`
- `examples/contracts/entity-unknown-schema-version.invalid.json`
- `examples/contracts/entity-unknown-policy-version.invalid.json`
- `examples/contracts/entity-review-decision.valid.json`
- `examples/contracts/entity-review-missing-evidence.invalid.json`
- `examples/contracts/entity-review-stale-binding.invalid.json`
- `examples/contracts/article-draft.valid.json`
- `examples/contracts/article-medical-editorial.invalid.json`
- `examples/contracts/article-agent-human-gates.invalid.json`
- `examples/contracts/article-duplicate-source-id.invalid.json`
- `examples/contracts/article-unsupported-locale.invalid.json`
- `examples/contracts/article-oversized-array.invalid.json`
- `examples/contracts/article-review-decision.valid.json`
- `examples/contracts/article-medical-reviewer-role.invalid.json`
- `examples/contracts/automation-job.valid.json`
- `examples/contracts/automation-running-without-lease.invalid.json`
- `examples/contracts/automation-budget-relationship.invalid.json`
- `examples/contracts/service-identity.valid.json`
- `examples/contracts/service-execute-without-fencing.invalid.json`
- `examples/contracts/service-identity-ttl-too-long.invalid.json`
- `examples/contracts/service-identity-stale-lease.invalid.json`
- `examples/contracts/source-policy.valid.json`
- `examples/contracts/source-policy-approved-blocked.invalid.json`
- `examples/contracts/source-observation.valid.json`
- `examples/contracts/source-observation-denied-raw.invalid.json`
- `examples/contracts/source-observation-http-scheme.invalid.json`
- `examples/contracts/persian-report.valid.json`

## Validation artifact

- `VALIDATION_REPORT.md`
- `CHECKSUMS.sha256`

## Safety

هیچ فایل این بسته به‌تنهایی مجوز migration، runtime activation، production secret، public/index/sitemap promotion یا Agent mutation ایجاد نمی‌کند.
