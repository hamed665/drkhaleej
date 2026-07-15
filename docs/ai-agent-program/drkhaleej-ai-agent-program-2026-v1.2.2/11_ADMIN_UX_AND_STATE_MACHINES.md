# Admin UX و State Machineها

## Authority Boundary

Controlled Publish UI روی authority فعلی `/admin/imports/readiness` باقی می‌ماند. Entity Intelligence و Content sections تا migration/runtime مربوط و Gate مستقل فقط navigation proposal هستند. UI نباید با نمایش control، capabilityای را که server فعال نکرده القا کند.

## Navigation

پیشنهاد بخش‌ها:

```text
Admin
├── Imports & Publish Readiness
├── Entity Intelligence
│   ├── Draft Queue
│   ├── Conflicts
│   ├── Duplicate Candidates
│   └── Source Health
├── Content & SEO
│   ├── Opportunities
│   ├── Research Packs
│   ├── Drafts
│   └── Refresh Queue
├── Monitoring
│   ├── Alerts
│   ├── Jobs
│   ├── Costs
│   └── Reports
└── Automation Settings
    ├── Sources
    ├── Budgets
    ├── Schedules
    └── Kill Switches
```

از design system موجود استفاده شود؛ Admin دوم ساخته نشود.

## Controlled Publish State Machine

```text
Dry Run
→ Exact Review
→ Authorization Ready
→ Reserved
→ Reservation Verified
→ Private Published
→ Publish Verified
→ Rolled Back
→ Recovery Verified
→ Closed/Audited
```

UI state همیشه از Server Readback بیاید.

## Entity Draft State Machine

```text
collecting
→ needs_review
→ approved_for_exact_review
→ superseded

needs_review → rejected
needs_review → collecting (re-fetch)
```

Draft Approval برابر Publish Approval نیست.

## Article State Machine

این state machine فقط پس از Content Authority Gate قابل اجراست. Agent فقط تا `editorial_review` یا `medical_review` پیش می‌رود؛ `approved/scheduled/published` نیازمند CMS authority و Human Reviewer است.

```text
idea
→ researched
→ brief_ready
→ drafted
→ editorial_review
→ medical_review?
→ approved
→ scheduled
→ published
→ refresh_due
→ archived
```

## Entity Review Screen

برای هر field:

- current value؛
- proposed value؛
- normalized value؛
- source و trust؛
- observed time/freshness؛
- evidence excerpt؛
- confidence؛
- conflict count؛
- accept/edit/reject.

در بالای صفحه:

- family؛
- duplicate candidates؛
- required-field completeness؛
- cost؛
- source count؛
- job trace؛
- warnings؛
- `Prepare Exact Review`، نه Publish.

## Content Review Screen

- search intent؛
- target locale؛
- opportunity metrics؛
- source pack؛
- claims/citations؛
- brief vs draft coverage؛
- medical sensitivity؛
- internal links؛
- SEO fields؛
- revision diff؛
- editorial/medical approvals.

## Jobs Dashboard

ستون‌ها:

```text
job type
scope
priority
status
attempt
started/duration
cost
model
source
error class
next action
```

Actions:

- cancel queued؛
- pause source؛
- retry read-only؛
- create review task؛
- inspect bounded logs؛
- never blind retry mutation.

## UX Safety

- typed confirmation برای Reserve/Publish/Rollback؛
- no optimistic success برای write؛
- fresh success و replay جدا؛
- stale version banner؛
- multi-tab collision message؛
- expiry countdown server-based؛
- errors بدون secret؛
- Admin deep-link با authorization عادی، نه token در URL.
- role separation برای platform admin، entity reviewer، editor و medical reviewer؛
- هیچ approved/verified state صرفاً از browser status پذیرفته نشود؛
- optimistic success برای job completion، publish و rollback ممنوع است.
