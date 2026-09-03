# Cloudflare Candidate Workflow Runbook

Status: installed and runtime-proven on PR #978.

This workflow is the isolated paid-account candidate bridge for Cloudflare Web runtime validation. It exists only on the `infra/cloudflare-web-readiness` branch trigger and does not configure a Production route or custom domain.

## Safety boundary

The workflow:

- runs only on `infra/cloudflare-web-readiness` pushes;
- reads the candidate Cloudflare account/token, existing Preview project ref and Preview publishable key from GitHub Secrets;
- deploys only `drkhaleej-web-candidate` on `workers.dev`;
- does not configure a route or custom domain;
- does not receive a service-role key;
- keeps indexing disabled;
- uses DrKhaleej Preview Supabase only;
- invokes `scripts/cloudflare/deploy-web-candidate.mjs` for non-mutating/fail-closed HTTP/API/Server Action/SEO/load/Tail smoke;
- never prints secret values or Supabase project refs.

Installed workflow path:

`.github/workflows/cloudflare-web-candidate.yml`

A successful run ends with:

`CANDIDATE_GATE=GREEN`

The candidate Worker URL may be logged. Secret values, API tokens and Supabase project refs must not be logged.

The workflow is not authority to change Production DNS. Production routing and secrets belong to PR B after PR A exact-head CI/review is green.
