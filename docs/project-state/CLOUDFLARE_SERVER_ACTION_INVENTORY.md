# Cloudflare Server Action Inventory

> Generated deterministically from the migration branch source tree. This inventory performs no runtime invocation, database mutation, deployment or Production change.

- Source commit: `ddb276780dd88072805a0bb03d5bfc1274e231f7`
- Source files scanned: **931**
- Files containing an exact `use server` directive: **35**
- Files with module-level `use server` as the first executable statement: **33**
- Files with inline-only `use server` directive(s): **2**
- Total exact directive lines: **53**

## Exact source inventory

| Path | Directive shape | Line(s) | Source SHA256 |
| --- | --- | ---: | --- |
| `src/app/admin/imports/[batchId]/ops/page.tsx` | inline-only | 62, 77, 92, 116, 131, 146, 161, 176, 191 | `b477c137ddc40fc2a777c8a06ad3331d668be0ab1140b2370abdea3bce06602d` |
| `src/app/admin/imports/[batchId]/page.tsx` | inline-only | 27, 40, 53, 75, 97, 115, 128, 141, 154, 167, 180 | `d14932be03e544d748e111414a02795d9e6e78f29154c985630fc9415feeb9b3` |
| `src/app/admin/imports/readiness/actions-complete-canary.ts` | module-level | 1 | `f4adeed2f250b980c81f1b49b451c96eb1e01b790ce81d7fea53d7acfce517ae` |
| `src/app/admin/imports/readiness/actions-expired-reservation-recovery-safe.ts` | module-level | 1 | `d1d8b736e1ad59ab0ce6dde03aeb45e4aea6eace9779ea8387e86cd25be6cf3c` |
| `src/app/admin/imports/readiness/actions-expired-reservation-recovery.ts` | module-level | 1 | `99ab2372e02c58d78fa4bd063b9f942de4b1b17b079ce6a87b2df85c5d088f08` |
| `src/app/admin/imports/readiness/actions.ts` | module-level | 1 | `b9f21e88f67668090c07676ce8220f8c1afcf9d1e8b496d10fec032e0bfbab9b` |
| `src/server/admin/active-center-address-actions.ts` | module-level | 1 | `17f06d0f936a1fbfbaa1c33874e6017ee8409c8757d37eef896c7c15766e3390` |
| `src/server/admin/active-center-basic-profile-actions.ts` | module-level | 1 | `485cf14fbaf6a9ed690404b6cec5ccfe97e0a893a164bcdf9d2f92b50383597f` |
| `src/server/admin/active-center-contact-actions.ts` | module-level | 1 | `7ea120626b70735f8fa63a1b26f5b85d265ac9e00adaf51940919b19287af031` |
| `src/server/admin/active-center-contact-edit-actions.ts` | module-level | 1 | `1a26b4097a88194b047f391a63a41f78dcacaa2100f9cbbe4ba5af4ff2b8bcdc` |
| `src/server/admin/active-center-public-state-actions.ts` | module-level | 1 | `98335716c45f653c719f323db7d2a6d250df798bfd601533d593ca89bb0d64fb` |
| `src/server/admin/center-subscription-actions.ts` | module-level | 1 | `9a5b46bfeab5bac386146084a082edf9b4f0a5cce7a6c59eeb07fcebe7172943` |
| `src/server/admin/cms-content-actions.ts` | module-level | 1 | `3470d80013eceb71f3f5b63c715b5add8717d36b9615106967571f5cfdc13b95` |
| `src/server/admin/cms-faq-actions.ts` | module-level | 1 | `1f1886740d80a639b8490145d644512cbecdcacc63725d66fe3175826a0338be` |
| `src/server/admin/commercial-addon-actions.ts` | module-level | 1 | `600cc602742d081f210e480b61b9491643a8675d215bda73658f87461d3af7a5` |
| `src/server/admin/draft-center-actions.ts` | module-level | 1 | `582bd84e43d8a94e307e6b9347dba120d714b51efd79b868f1af9f9236fd0b92` |
| `src/server/admin/draft-center-contact-visibility-actions.ts` | module-level | 1 | `053ff6c2f9fb47713da50b7f2e19d4b38e67d9f764aa2b4557359ed0d1666403` |
| `src/server/admin/draft-center-create-actions.ts` | module-level | 1 | `3a72717b150b63d8e64414cbcfaf6786f956bc6f0623421207a9e3e1c5c0704a` |
| `src/server/admin/draft-center-location-actions.ts` | module-level | 1 | `d752b492ac1af6851eb44bfdb4815a59893b88f35971945fd0678edeb2648ea9` |
| `src/server/admin/draft-center-public-activation-actions.ts` | module-level | 1 | `0440a4c74a69b5f9747a5808ad5709c4e8e1090cd45b19561d759926a18de003` |
| `src/server/admin/draft-center-safe-actions.ts` | module-level | 1 | `0aa3f9c64634650223f7d48190e9a57631bb5d12e57cf772e3757ce789823272` |
| `src/server/admin/draft-center-taxonomy-actions.ts` | module-level | 1 | `5f41061baf82a37ec9de7e76429fde610c765181ba3d20dc011965ae2f23ac10` |
| `src/server/admin/draft-center-workflow-actions.ts` | module-level | 1 | `cdc809564cd61f7c2e51b89e28a1b62dcab96bdd07c9d0c28fdc47e417304bed` |
| `src/server/admin/import-duplicate-resolution.ts` | module-level | 1 | `78c720212dc262832079329b5d9726dd3aaa5e25201c4fa09ad8e32089133349` |
| `src/server/admin/import-index-promotion.ts` | module-level | 1 | `ded7e83be030659d848d0b0c46c7ff3e062c6304abfb0a03790a4563caba997c` |
| `src/server/admin/import-noindex-publish.ts` | module-level | 1 | `b1f2b87c17976b00d6b3de275f81572fc4e8a94c2866f0c5a1cb3c65ca278756` |
| `src/server/admin/import-public-projection.ts` | module-level | 1 | `e8414ef69d46b753d550a3109e44b055c1610557ad49078e170838bee50a9918` |
| `src/server/admin/import-relation-candidates.ts` | module-level | 1 | `af960cd4f9c72dfa038c5e114ed39709f643af42e28cefe32c6404cd3bbf9ba5` |
| `src/server/admin/import-row-review.ts` | module-level | 1 | `7258e14504fc56f2a433bcb2ab397e19f859190724af89f1b4b3d28bd3ef2916` |
| `src/server/admin/import-sitemap-inclusion.ts` | module-level | 1 | `25218dcdf6096f021b578ffd9299bff049510aec6420430cae8bebb484ad769c` |
| `src/server/admin/import-upload-actions.ts` | module-level | 1 | `30a4565ef72c26b74ad5b4dedd8728a95190b17d0833bfa9f1dc95c228870d2f` |
| `src/server/admin/media-library-actions.ts` | module-level | 1 | `e9675ed39c7b5d1bf4240345fc37802625a4015c5185d589899832d1be72dc4d` |
| `src/server/admin/provider-onboarding-lead-actions.ts` | module-level | 1 | `753f21447f2b06fbe420b5911ad2e63a808176a72edc4ddae731496b0be5bb85` |
| `src/server/admin/provider-onboarding-lead-center-actions.ts` | module-level | 1 | `038f87737c6b4f051997efee730af74bc6b489a4eb6469736740c5b139b41322` |
| `src/server/admin/subscription-plan-catalog-actions.ts` | module-level | 1 | `923e04ffbaaf36fc76c6033f58f9aa04454045b7b717d5e562f5d4d27e044f90` |

## Migration QA rule

- Cloudflare candidate QA must include representative **safe** Server Action execution for auth/session, ordinary admin mutation validation, and read-only/private workflows where applicable.
- Destructive, publish, rollback, index-promotion, sitemap-promotion, bulk-import, or externally visible actions must **not** be invoked merely to prove hosting compatibility.
- Build success alone is not evidence of Server Action runtime parity.
- This file records source presence only; authorization and side-effect semantics remain owned by the existing application contracts.
