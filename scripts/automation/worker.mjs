#!/usr/bin/env node

import { createHash, createPrivateKey, randomUUID, sign } from 'node:crypto';

const SUBJECT = 'urn:drkhaleej:service:worker-preview';
const AUDIENCE = 'urn:drkhaleej:internal-automation:v1';
const PATH = '/api/internal/automation';
const INSTANCE = randomUUID();
const POLL_MS = 5_000;
const MAX_RESPONSE_BYTES = 16_000;

function boundedEvent(code) {
  process.stderr.write(`automation_worker_event=${code}\n`);
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function required(name, maximum = 16_000) {
  const value = process.env[name]?.trim();
  if (!value || value.length > maximum) throw new Error(`missing_${name.toLowerCase()}`);
  return value;
}

function previewConfiguration() {
  const appEnvironment = process.env.APP_ENV?.trim();
  const emergency = process.env.AUTOMATION_EMERGENCY_ENABLED?.trim();
  const probe = process.env.AUTOMATION_RUNTIME_PROBE_ENABLED?.trim();
  if (appEnvironment !== 'preview' || emergency !== 'true' || probe !== 'true') return null;
  const baseUrl = required('AUTOMATION_INTERNAL_API_BASE_URL', 240);
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== 'https:' || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash ||
    parsed.pathname !== '/' || /(^|\.)localhost$/.test(parsed.hostname)) throw new Error('internal_api_url_invalid');
  const kid = required('AUTOMATION_SERVICE_KEY_ID', 80);
  if (!/^worker-preview-[0-9]{8}-[0-9]{2}$/.test(kid)) throw new Error('service_key_id_invalid');
  const privateKey = createPrivateKey({
    key: Buffer.from(required('AUTOMATION_SERVICE_PRIVATE_KEY_PEM_BASE64'), 'base64').toString('utf8'),
    format: 'pem',
  });
  if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('service_private_key_invalid');
  return { endpoint: new URL(PATH, parsed).toString(), kid, privateKey };
}

function token(config, scope, body, jobBinding = null) {
  const now = Math.floor(Date.now() / 1_000);
  const claims = {
    schema_version: 'drkhaleej.automation.serviceJwt.v1',
    iss: SUBJECT,
    sub: SUBJECT,
    aud: AUDIENCE,
    iat: now,
    exp: now + 300,
    jti: randomUUID(),
    scope,
    method: 'POST',
    path: PATH,
    req_sha256: createHash('sha256').update(body).digest('hex'),
    worker_instance: INSTANCE,
    ...(jobBinding ? { job_id: jobBinding.jobId, lease_epoch: jobBinding.leaseEpoch } : {}),
  };
  const header = { alg: 'Ed25519', kid: config.kid, typ: 'JWT' };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  return `${signingInput}.${base64url(sign(null, Buffer.from(signingInput), config.privateKey))}`;
}

async function operation(config, scope, payload, jobBinding = null) {
  const body = JSON.stringify(payload);
  const response = await fetch(config.endpoint, {
    method: 'POST',
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${token(config, scope, body, jobBinding)}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) throw new Error('control_plane_response_too_large');
  const result = JSON.parse(Buffer.from(bytes).toString('utf8'));
  if (!response.ok || result?.ok !== true || typeof result.result !== 'object' || result.result === null) {
    throw new Error(typeof result?.code === 'string' ? result.code : 'control_plane_rejected');
  }
  return result.result;
}

async function runProbe(config) {
  const claim = await operation(config, 'job:lease', { operation: 'claim_job', jobTypes: ['report'] });
  if (claim.status === 'empty') return;
  if (claim.status !== 'claimed' || typeof claim.jobId !== 'string' || typeof claim.leaseToken !== 'string' ||
    !Number.isSafeInteger(claim.leaseEpoch) || claim.workerInstance !== INSTANCE || claim.jobType !== 'report') {
    throw new Error('claim_contract_invalid');
  }
  const binding = { jobId: claim.jobId, leaseEpoch: claim.leaseEpoch };
  const lease = {
    jobId: claim.jobId,
    workerInstance: INSTANCE,
    leaseToken: claim.leaseToken,
    leaseEpoch: claim.leaseEpoch,
  };
  await operation(config, 'job:execute', { operation: 'start_job', ...lease }, binding);
  const outputHash = createHash('sha256').update(`p19-runtime-probe:${claim.jobId}:${claim.leaseEpoch}`).digest('hex');
  await operation(config, 'job:complete', {
    operation: 'complete_job',
    ...lease,
    result: 'waiting_review',
    retryDelaySeconds: null,
    completionIdempotencyKey: `p19-runtime-probe-${claim.jobId}-${claim.leaseEpoch}`,
    outputHash,
  }, binding);
}

let stopping = false;
process.once('SIGTERM', () => { stopping = true; });
process.once('SIGINT', () => { stopping = true; });

while (!stopping) {
  try {
    const config = previewConfiguration();
    if (config !== null) await runProbe(config);
  } catch (error) {
    const code = error instanceof Error && /^[a-z0-9_]{1,80}$/.test(error.message)
      ? error.message
      : 'worker_bounded_failure';
    boundedEvent(code);
  }
  await new Promise((resolve) => setTimeout(resolve, POLL_MS));
}

boundedEvent('stopped');
