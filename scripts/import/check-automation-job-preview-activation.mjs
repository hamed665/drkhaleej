#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  activation: 'src/server/imports/automation-preview-activation.ts',
  activationTests: 'src/server/imports/automation-preview-activation.test.ts',
  route: 'src/app/api/internal/automation/route.ts',
  routeTests: 'src/app/api/internal/automation/route.test.ts',
  worker: 'scripts/automation/worker.mjs',
  render: 'render.yaml',
  env: '.env.example',
  docs: 'docs/import/AUTOMATION_JOB_PREVIEW_ACTIVATION.md',
  workflow: '.github/workflows/preview-migration-sync.yml',
};

function read(file) { return readFileSync(path.join(root, file), 'utf8'); }
function requireTokens(file, source, tokens) {
  for (const token of tokens) if (!source.includes(token)) throw new Error(`${file}: missing required token ${token}`);
}
function forbid(file, source, pattern, message) {
  if (pattern.test(source)) throw new Error(`${file}: ${message}`);
}

const activation = read(files.activation);
const activationTests = read(files.activationTests);
const route = read(files.route);
const routeTests = read(files.routeTests);
const worker = read(files.worker);
const render = read(files.render);
const env = read(files.env);
const docs = read(files.docs);
const workflow = read(files.workflow);

requireTokens(files.activation, activation, [
  'drkhaleej.import.automationPreviewActivation.v1',
  'AUTOMATION_PREVIEW_ACTIVATION_ENABLED !== "true"',
  'AUTOMATION_PREVIEW_ACTIVATION_SHA',
  'VERCEL_GIT_COMMIT_SHA',
  'RENDER_GIT_COMMIT',
  'VERCEL_ENV !== "preview"',
  'environment.RENDER !== "true"',
  'environment.RENDER_GIT_REPO_SLUG !== "hamed665/drkhaleej"',
  'environment.IS_PULL_REQUEST !== "false"',
  'previewProjectRef === productionProjectRef',
  '\\.vercel\\.app$',
]);
requireTokens(files.activationTests, activationTests, [
  'admits only the exact Vercel Preview commit',
  'admits only one manual Render instance from the reviewed repository commit',
  'stays closed when activation or either runtime switch is absent',
  'rejects cross-SHA Vercel/Render drift and Production identity reuse',
]);
requireTokens(files.route, route, [
  'resolveAutomationPreviewActivation(process.env, "vercel")',
  'new URL(request.url).hostname !== activation.previewHost',
  'supabaseUrl.includes(productionRef)',
]);
requireTokens(files.routeTests, routeTests, [
  'rejects a different Vercel host before identity work',
  'AUTOMATION_PREVIEW_ACTIVATION_ENABLED',
  'AUTOMATION_PREVIEW_ACTIVATION_SHA',
]);
requireTokens(files.worker, worker, [
  "process.env.AUTOMATION_PREVIEW_ACTIVATION_ENABLED?.trim()",
  "required('AUTOMATION_PREVIEW_ACTIVATION_SHA', 40)",
  "required('RENDER_GIT_COMMIT', 40)",
  "process.env.RENDER_GIT_REPO_SLUG !== 'hamed665/drkhaleej'",
  "process.env.IS_PULL_REQUEST !== 'false'",
  "parsed.hostname !== previewHost",
  "throw new Error('preview_activation_invalid')",
]);
forbid(files.worker, worker, /SUPABASE|DATABASE_URL|STORAGE|service[_-]?role|publish|rollback/i,
  'Worker must hold no database, Storage or downstream authority');
requireTokens(files.render, render, [
  'name: drkhaleej-automation-worker-preview',
  'region: frankfurt',
  'plan: starter',
  'numInstances: 1',
  'autoDeployTrigger: off',
  'AUTOMATION_PREVIEW_ACTIVATION_ENABLED',
  'value: "false"',
  'AUTOMATION_PREVIEW_ACTIVATION_SHA',
  'AUTOMATION_VERCEL_PREVIEW_HOST',
]);
forbid(files.render, render, /type:\s*(web|pserv)|disk:|databases:|scaling:|autoDeployTrigger:\s*(commit|checksPass)/,
  'activation must remain one manual Background Worker without endpoint, disk, datastore or autoscale');
requireTokens(files.env, env, [
  'AUTOMATION_PREVIEW_ACTIVATION_ENABLED=false',
  'AUTOMATION_PREVIEW_ACTIVATION_SHA=',
  'AUTOMATION_VERCEL_PREVIEW_HOST=',
]);
forbid(files.env, env, /BEGIN (RSA|EC|OPENSSH|PRIVATE) PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\./,
  'environment example must not contain a credential');
requireTokens(files.docs, docs, [
  '`AUTOMATION-JOB-PREVIEW-ACTIVATION`',
  'external evidence pending',
  'monthlyCostCapUsd": 7',
  'controlsDefaultEnabled": false',
  'Production remains disconnected',
  'Items 9–11 may be recorded as `closed_not_exercised`',
]);
requireTokens(files.workflow, workflow, [
  "'scripts/import/check-automation-job-preview-activation.mjs'",
  "'docs/import/AUTOMATION_JOB_PREVIEW_ACTIVATION.md'",
  'pnpm import:automation-job-preview-activation:validate',
]);

console.log('automation job Preview activation static contract passed.');
