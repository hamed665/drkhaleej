# Branch Protection و Independent Review Policy

## هدف

CI سبز جایگزین review مستقل نیست. این policy باید پیش از اولین PR رفتاری بعد از P01 در repository ثبت و در branch protection/ruleset اعمال شود.

## حداقل قواعد main

- direct push ممنوع؛
- required pull request؛
- required status checks روی head فعلی؛
- dismiss stale approvals after new commits؛
- conversation resolution required؛
- branch up-to-date یا merge queue با evidence روی commit نهایی؛
- force push و branch deletion ممنوع؛
- bypass فقط برای incident documented و با audit؛
- Vercel Preview و GitHub Actions مربوط به scope required باشند.

## Review مستقل اجباری

حداقل یک approval انسانی مستقل برای این scopeها لازم است:

- migration، RLS، grant و RPC؛
- authorization، reservation، idempotency و replay؛
- private publish، rollback و promotion؛
- service identity، secrets، logging و tracing؛
- runtime activation، Worker و queue؛
- public/index/sitemap behavior؛
- medical/editorial approval authority.

Author approval، bot comment، green CI، generated summary و Agent self-review جای approval مستقل را نمی‌گیرند. اگر پروژه موقتاً تک‌نفره است، PR نباید Enterprise-reviewed نامیده شود؛ یک reviewer account/qualified reviewer باید قبل از runtime activation اضافه شود.

## Suggested CODEOWNERS coverage

CODEOWNERS باید ownerهای واقعی و مستقل را برای این مسیرها پوشش دهد:

```text
/supabase/migrations/
/src/server/admin/
/src/server/agents/
/scripts/db/
/scripts/workers/
/.github/workflows/
/docs/project-state/
```

نام کاربری placeholder نباید Merge شود. branch ruleset باید approval CODEOWNER را برای مسیرهای حساس enforce کند.

## Evidence

هر PR حساس باید review ID، reviewer، reviewed commit SHA، unresolved thread count صفر و required-check summary را در Evidence Bundle ثبت کند.
