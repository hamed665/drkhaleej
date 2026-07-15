# Import Readiness Alignment Guard — Required Specification

## Scope

این guard non-runtime است و در P01 کنار factual docs alignment اضافه می‌شود. هیچ capability، migration، route یا production behavior را تغییر نمی‌دهد.

## Files checked

- `docs/import/import-readiness-roadmap-after-933.md`
- `docs/project-state/CURRENT_STATE.md`
- `docs/project-state/V10_4_PHASE_ALIGNMENT_MATRIX.md`
- root `README.md`
- Issue #934 post-merge readback

## Required repository assertions after P01

```text
Aligned through: PR #943
Baseline commit: 74541b9f32acb201a9bf94d54d0be757842f5b8c
Migration current: 0079_import_pharmacy_atomic_authorization_reservation.sql
Current next: RES-INTEGRITY-READBACK
Wave 0: COMPLETE
Wave 1: COMPLETE
Wave 2.1: PARTIAL
Wave 2.2: PARTIAL
Wave 3+: OPEN
```

## Guard behavior

1. Parse structured tokens from the canonical roadmap؛ از prose substring-only check استفاده نشود.
2. Assert CURRENT_STATE migration range و current-next با roadmap برابر است.
3. Assert Matrix فقط mapping است و status evidence برای #936–#943 را دارد.
4. Assert root README عدد migration قدیمی مثل `0053` را current معرفی نمی‌کند و فقط به source-of-truth لینک می‌دهد.
5. Fail اگر `reservation_created` به‌عنوان implemented claim ثبت شده باشد؛ تا P04-A signature فعلی `execution_started + phase=reservation` است.
6. روی pull request فقط repository files را بررسی کند.
7. بعد از merge، workflow/readback جدا Issue #934 را با merged SHA و expected checklist می‌سنجد؛ Issue mutation اتمیک با commit نیست.
8. خطا باید file، expected token و actual token bounded بدهد.

## Required workflow safety

- `contents: read` و برای post-merge Issue readback فقط `issues: read`؛
- هیچ write permission در validation job؛
- third-party unpinned action ممنوع؛
- script در `pnpm import:publish-readiness-audit:validate` یا required check مستقل chain شود.

## Acceptance

- تغییر عمدی هرکدام از baseline/migration/current-next در یک fixture باعث failure شود؛
- drift یک فایل از چهار فایل باعث failure شود؛
- PR runtime بدون docs status change همچنان pass شود؛
- P01 runtime/migration/schema diff صفر بماند؛
- Issue post-merge readback لینک merged SHA را تأیید کند.
