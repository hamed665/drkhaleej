# Admin Operational Validator Index

This index documents the admin validator chain that protects the launch-critical admin and public-provider workflow. It is intentionally operational, not product scope approval. New admin validators must be added here when they are wired into the validation chain.

## Naming rules

- Admin validator scripts use the package script form `admin:<scope>:validate`.
- Runtime validators include `runtime` in the script name when they inspect server actions, runtime helpers, or UI-to-action wiring.
- Contract validators include `contract` when they lock documentation, allowed transitions, or required static tokens.
- Read-only validators include `readonly` when they protect admin surfaces from mutation behavior.
- Compact chain validators keep their historical short names, but they must stay documented here so nobody has to archaeologically excavate package.json like it is a cursed tomb.

## Admin validator groups

### Access and role guards

| Package script | Script file | Purpose |
| --- | --- | --- |
| `admin:draft-verification-guard:validate` | `scripts/admin/check-draft-center-verification-guard.mjs` | Draft verification gate coverage. |
| `admin:role-runtime-guard:validate` | `scripts/admin/check-admin-role-runtime-guard.mjs` | Admin role runtime guard coverage. |

### Draft center location workflow

| Package script | Script file | Purpose |
| --- | --- | --- |
| `admin:location-contract:validate` | `scripts/admin/check-draft-location-create-contract.mjs` | Draft location create contract. |
| `admin:location-create-runtime:validate` | `scripts/admin/check-draft-location-create-runtime.mjs` | Draft location create runtime. |
| `admin:location-edit-runtime:validate` | `scripts/admin/check-draft-location-edit-runtime.mjs` | Draft location edit runtime. |
| `admin:location-primary-runtime:validate` | `scripts/admin/check-draft-location-primary-runtime.mjs` | Draft location primary selection runtime. |
| `admin:location-review-contract:validate` | `scripts/admin/check-draft-location-review-contract.mjs` | Draft location review contract. |
| `admin:location-review-runtime:validate` | `scripts/admin/check-draft-location-review-runtime.mjs` | Draft location review runtime. |
| `admin:location-review-ui:validate` | `scripts/admin/check-draft-location-review-ui.mjs` | Draft location review UI. |

### Contact, quality, and publication gates

| Package script | Script file | Purpose |
| --- | --- | --- |
| `admin:quality-internal-gate:validate` | `scripts/admin/check-draft-center-quality-internal-gate.mjs` | Draft center internal quality gate. |
| `admin:contact-visibility-contract:validate` | `scripts/admin/check-contact-visibility-contract.mjs` | Contact visibility contract. |
| `admin:contact-review-guard:validate` | `scripts/admin/check-draft-center-contact-review-guard.mjs` | Contact review guard. |
| `admin:provider-publication-contract:validate` | `scripts/admin/check-provider-publication-contract.mjs` | Provider publication contract. |

### Launch chain and read-only surfaces

| Package script | Script file | Purpose |
| --- | --- | --- |
| `admin:final-chain:validate` | `scripts/admin/check-admin-final-chain.mjs` | Final admin launch chain. |
| `admin:launch-checklist:validate` | `scripts/admin/check-launch-smoke-checklist.mjs` | Launch smoke checklist. |
| `admin:post-activation:validate` | `scripts/admin/check-post-activation-verifier.mjs` | Post-activation verifier. |
| `admin:provider-view-contract:validate` | `scripts/admin/check-provider-view-contract.mjs` | Provider view contract. |
| `admin:active-centers-readonly:validate` | `scripts/admin/check-active-centers-readonly-view.mjs` | Active centers read-only surface. |
| `admin:audit-log-readonly:validate` | `scripts/admin/check-audit-log-readonly-route.mjs` | Audit log read-only surface. |
| `admin:final-launch-recap:validate` | `scripts/admin/check-final-launch-chain-recap.mjs` | Final launch recap. |
| `admin:final-route-sanity:validate` | `scripts/admin/check-final-route-indexability-sanity.mjs` | Final route/indexability sanity. |
| `admin:soft-launch-checklist:validate` | `scripts/admin/check-soft-launch-operator-checklist.mjs` | Soft-launch operator checklist. |

### Compact historical chain

| Package script | Script file | Purpose |
| --- | --- | --- |
| `admin:r1:validate` | `scripts/admin/check-r1.mjs` | R1 admin guard bundle. |
| `admin:readiness-bundle:validate` | `scripts/admin/check-readiness-bundle.mjs` | Readiness bundle guard. |
| `admin:cw:validate` | `scripts/admin/check-cw.mjs` | CW compact guard. |
| `admin:fo:validate` | `scripts/admin/check-fo.mjs` | FO compact guard. |
| `admin:gng:validate` | `scripts/admin/check-gng.mjs` | Go/no-go compact guard. |
| `admin:fpi:validate` | `scripts/admin/check-fpi.mjs` | FPI compact guard. |
| `admin:w:validate` | `scripts/admin/check-wave.mjs` | Wave compact guard. |
| `admin:av:validate` | `scripts/admin/check-av.mjs` | Active view compact guard. |

## Chain boundary

This index does not authorize new admin product behavior. It only documents validators that already exist in the operational chain. Runtime changes, new admin mutations, public route promotion, indexing changes, billing, claims, or commercial behavior require their own scoped PR and validator updates.
