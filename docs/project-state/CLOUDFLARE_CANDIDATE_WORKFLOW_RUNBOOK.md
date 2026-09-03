# Cloudflare Candidate Workflow Runbook

This runbook exists because the migration tooling session is not permitted to create a GitHub Actions workflow that consumes repository secrets directly. The workflow below is the only manual bridge required for the lower-privilege paid-account candidate.

## Safety boundary

The workflow:

- runs only on `infra/cloudflare-web-readiness` pushes;
- reads the three already-created candidate secrets plus the existing Preview project ref;
- deploys only `drkhaleej-web-candidate` on `workers.dev`;
- does not configure a route or custom domain;
- does not receive a service-role key;
- keeps indexing disabled;
- uses DrKhaleej Preview Supabase only;
- invokes `scripts/cloudflare/deploy-web-candidate.mjs`, which performs non-mutating smoke and fails on any 5xx or canonical drift.

## Single manual bridge

In GitHub, switch to branch `infra/cloudflare-web-readiness`, create exactly:

`.github/workflows/cloudflare-web-candidate.yml`

Paste the workflow below and commit it directly to **that branch**, not `main`. The push itself triggers the candidate run, so no separate Actions button is required.

```yaml
name: Cloudflare Web Candidate

on:
  push:
    branches:
      - infra/cloudflare-web-readiness

permissions:
  contents: read

jobs:
  candidate:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      PREVIEW_PROJECT_REF: ${{ secrets.PREVIEW_PROJECT_REF }}
      PREVIEW_SUPABASE_ANON_KEY: ${{ secrets.PREVIEW_SUPABASE_ANON_KEY }}

    steps:
      - name: Checkout exact candidate branch
        uses: actions/checkout@v4
        with:
          ref: infra/cloudflare-web-readiness
          fetch-depth: 1

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Enable Corepack
        run: corepack enable

      - name: Prepare pnpm 10.22.0
        run: corepack prepare pnpm@10.22.0 --activate

      - name: Install locked dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy and smoke isolated Cloudflare candidate
        run: node scripts/cloudflare/deploy-web-candidate.mjs
```

## Expected result

A successful run ends with:

`CANDIDATE_GATE=GREEN`

The candidate Worker URL may be logged. Secret values, API tokens and Supabase project refs must not be logged.

Do not merge PR #978 based only on workflow creation. The workflow result and candidate runtime evidence must be reviewed first.
