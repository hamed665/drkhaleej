# Baseline و هم‌ترازی فعلی

## Baseline بررسی‌شده

```text
Repository: hamed665/drmuscat
Branch: main
Commit: 74541b9f32acb201a9bf94d54d0be757842f5b8c
PR: #943 merged
Aligned date: 2026-07-15
```

PR #943 روی head خود 12 GitHub workflow موفق و Vercel موفق داشته است. نبود workflow روی squash merge commit نباید به‌عنوان نبود CI تفسیر شود؛ evidence به head PR متصل است.

## Wave Ledger واقعی

```text
Wave 0     COMPLETE  (#936–#939)
Wave 1     COMPLETE  (#940–#941)
Wave 2.1   PARTIAL   (#942)
Wave 2.2   PARTIAL   (#943)
Wave 3+    OPEN
```

## دلیل PARTIAL بودن Wave 2.1

Migration `0079_import_pharmacy_atomic_authorization_reservation.sql` authorization، reservation، snapshot، audit و consumption را در یک transaction قرار داده است، اما audit فعلی هنوز این signature را دارد:

```text
event_type = execution_started
event_payload.phase = reservation
```

`reservation_created` در P04-A معرفی می‌شود و reader compatibility باید هم‌زمان حفظ شود؛ verified handoff مستقل در P04-B اجرا می‌شود.

## دلیل PARTIAL بودن Wave 2.2

عملیات bounded Admin Reservation وجود دارد، اما readback هنوز تمام این موارد را به‌صورت یک chain اثبات نمی‌کند:

- یک Authorization مصرف‌شده؛
- یک Reservation؛
- یک Snapshot؛
- یک Reservation Audit؛
- authorization→reservation linkage؛
- review/family/version/fingerprint/patch/request/scope equality؛
- صفر duplicate/orphan/audit gap؛
- صفر Entity Mutation.

## Drift فعلی که P01 باید حل کند

- Import roadmap هنوز current-next قبل از #936 را نشان می‌دهد؛
- `CURRENT_STATE.md` هنوز migration range تا `0053` و PRهای قدیمی را ثبت می‌کند؛
- V10.4 matrix هنوز import readiness جدید را map نکرده است؛
- Issue #934 checklist هنوز Wave 0/1 را complete نشان نمی‌دهد.

## Current Next

```text
Delivery task: P01 ALIGN-CURRENT-STATE
Runtime task after P01: P02 RES-INTEGRITY-READBACK
```

## قانون P01

P01 فقط documentation/state به‌همراه alignment validator/workflow غیرruntime است. فایل‌های runtime، migration، schema، UI، capability، route و Agent نباید تغییر کنند. root `README.md` باید factual migration/status references را اصلاح کند. Issue update بلافاصله پس از merge با merged SHA اعمال و readback می‌شود.

## Source of Truth

- Import Roadmap: wave status و strict order؛
- CURRENT_STATE: factual code/database state؛
- V10.4 Matrix: phase mapping؛
- Issue #934: checklist و links؛
- README: pointer، نه ledger موازی.

Ledger کامل نباید در چند مرجع مستقل نگهداری شود. اسناد دیگر فقط به source-of-truth لینک می‌دهند.

## Pre-branch safety

قبل از شروع هر PR وضعیت local worktree بررسی و فایل‌های unrelated ثبت شوند. هیچ فایل کاربر بدون scope صریح stage، overwrite یا commit نشود.
