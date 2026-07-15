# بسته‌ی اجرایی اصلاح‌شده DrKhaleej — 2026

نسخه: `1.2.2`

تاریخ بسته: `2026-07-16`

Baseline بررسی‌شده: `hamed665/drmuscat@74541b9` پس از Merge شدن PR `#943`

## حکم اجرایی

این بسته نسخه‌ی اصلاح‌شده‌ی برنامه‌ی Controlled Publish، Entity Intelligence، Content/SEO و Monitoring است. وضعیت اجرای آن به‌صورت زیر است:

```text
P01 تا P09 (با split شدن P04 به P04-A/P04-B): Conditional Go
P10 به بعد: فقط پس از Go/No-Go رسمی بعد از P09
Agent Canonical Mutation: ممنوع
Bulk: مسدود تا Final Gate
```

این بسته کد Production نیست و با قرارگرفتن در repository هیچ scope جدیدی را خودکار مجاز نمی‌کند. هر PR باید scope مستقل، mapping فاز، تست، readback و تأیید مربوط به خود را داشته باشد. PRهای migration، authorization، rollback، security و runtime activation بدون review مستقل Merge نمی‌شوند.

## اصلاحات اصلی نسخه 1.2.2

- زمان‌بندی واقعی به‌جای برآورد خوش‌بینانه؛
- تبدیل Phaseهای داخلی برنامه به `Program Milestone` برای جلوگیری از تعارض با V10.4؛
- Mapping اجباری Execution Phase، Lock Scope، Product Module و Subphase؛
- Proof واقعی Postgres/Supabase برای replay، concurrency، lock و abort؛
- handoff رسمی Reservation→Execution و ممنوعیت فراخوانی Reservation دوم؛
- قراردادهای JSON بسته، نسخه‌دار و سازگار با Human Approval؛
- ADR اجباری Worker، Queue، Service Identity، Storage و Observability؛
- lease fencing اجباری برای جلوگیری از stale-worker write؛
- Authority Gate مستقل برای Content/CMS/AI؛
- Compliance/Source Governance Gate و policy نسخه‌دار برای هر منبع؛
- جداسازی Candidate Agent از Human Reviewer Decision؛
- reconciliation taxonomy با vocabulary فعلی main؛
- بودجه‌ی اولیه، evaluation dataset و معیارهای قابل اندازه‌گیری؛
- Checkpoint رسمی Go/No-Go پس از Pharmacy Admin Canary.
- validator بازتولیدپذیر با dependencyهای بدون advisory شناخته‌شده، 9 schema و vectorهای مثبت/منفی با assertion علت دقیق؛
- جداسازی Article Candidate از Human Editorial/Medical Decision؛
- رد policy تأییدشده‌ی متناقض و جلوگیری از نگهداری raw observation ردشده؛
- vocabulary واحد برای service identity scopeها؛
- مرز صریح P04-B: refactor/handoff بدون فعال‌سازی Private Publish؛
- alignment guard غیرruntime، اصلاح صریح root README و review governance اجباری.

## ترتیب اجرای فوری

```text
P01 ALIGN-CURRENT-STATE
→ P02 RES-INTEGRITY-READBACK
→ P03 RES-DB-SAFETY-PROOF
→ P04-A RESERVATION-AUDIT-SPLIT
→ P04-B VERIFIED-RESERVATION-HANDOFF
→ P05 PRIVATE-ADMIN-WIRING
→ P06 ROLLBACK-AUTHORITY-HARDENING
→ P07 ROLLBACK-EXACT-RECOVERY
→ P08 ADMIN-STATE-MACHINE
→ P09 REAL-ADMIN-CANARY
→ POST-P09 GO/NO-GO
```

تا قبل از `POST-P09 GO` هیچ Agent Production، Hospital/Doctor publish lifecycle، public promotion، index، sitemap یا bulk باز نمی‌شود.

## ترتیب مطالعه

1. `00_MASTER_EXECUTION_PLAN_FA.md`
2. `01_CURRENT_BASELINE_AND_ALIGNMENT.md`
3. `14_ARCHITECTURE_DECISIONS_AND_PREREQUISITES.md`
4. `15_IMPLEMENTATION_PLAYBOOK.md`
5. `16_PROBLEM_RESOLUTION_REGISTER.md`
6. `17_COMPLIANCE_SOURCE_GOVERNANCE.md`
7. `18_CONTRACT_INVARIANTS_AND_VERSIONING.md`
8. `02_SYSTEM_ARCHITECTURE.md`
9. `06_DATA_API_CONTRACTS.md`
10. `07_PR_BACKLOG.md`
11. `08_TEST_AND_ACCEPTANCE_MATRIX.md`
12. `13_TIMELINE_TEAM_AND_DELIVERY.md`
13. اسناد تخصصی Entity، Content، Monitoring، Security، UX و Runbook

## فایل‌های آماده برای GitHub

- `github/ALIGN_CURRENT_STATE_PR_DRAFT.md`
- `github/ISSUE_934_UPDATED_DRAFT.md`
- `github/IMMEDIATE_EXECUTION_CHECKLIST.md`
- `github/POST_P09_GO_NO_GO_CHECKLIST.md`
- `github/PR_TEMPLATE.md`

## قراردادها

فایل‌های `contracts/*.schema.json` قرارداد پیشنهادی نسخه‌دار هستند. تا قبل از `CONTRACT-HARDENING` و integration با authorityهای موجود، migration یا API authority محسوب نمی‌شوند. برای validation بازتولیدپذیر ابتدا `npm ci` و سپس `npm run validate` اجرا شود. این validation جایگزین تست runtime/DB نیست.

## اولین اقدام

فقط `P01 ALIGN-CURRENT-STATE` اجرا شود. این PR factual documentation alignment به‌همراه alignment guard غیرruntime است و نباید runtime، migration، capability، route، agent یا schema جدیدی اضافه کند.
