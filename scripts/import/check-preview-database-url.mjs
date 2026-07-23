#!/usr/bin/env node

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function parseDatabaseUrl(connectionString) {
  try {
    return new URL(connectionString);
  } catch {
    throw new Error('Preview database URL is not a valid PostgreSQL URL.');
  }
}

export function validatePreviewDatabaseUrl(connectionString, previewProjectRef, productionProjectRef) {
  const parsed = parseDatabaseUrl(connectionString);

  assert(
    parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:',
    'Preview database URL must use PostgreSQL.',
  );
  assert(
    previewProjectRef && productionProjectRef && previewProjectRef !== productionProjectRef,
    'Preview and Production project references must be present and different.',
  );
  assert(
    parsed.hostname.endsWith('.pooler.supabase.com'),
    'Preview database URL must use the Supabase Session pooler host, not a direct or Production endpoint.',
  );
  assert.equal(
    parsed.port,
    '5432',
    'Preview database URL must use Session pooler port 5432; transaction pooling is forbidden.',
  );
  assert.equal(
    decodeURIComponent(parsed.username),
    `postgres.${previewProjectRef}`,
    'Preview database URL username must be scoped to the configured Preview project reference.',
  );
  assert.equal(
    parsed.pathname,
    '/postgres',
    'Preview database URL must target the postgres database.',
  );

  const password = decodeURIComponent(parsed.password || '');
  assert(password.length > 0, 'Preview database URL must include the database password.');
  assert(
    !/^\[?YOUR-PASSWORD\]?$/i.test(password),
    'Preview database URL still contains the password placeholder.',
  );

  return {
    protocol: parsed.protocol,
    port: parsed.port,
    sessionPooler: true,
    previewIdentityMatched: true,
    productionIdentityRejected: true,
  };
}

function runSelfTest() {
  const previewRef = 'previewprojectref1234';
  const productionRef = 'productionproject12';
  const valid = `postgresql://postgres.${previewRef}:encoded%3Dpassword@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;

  assert.equal(
    validatePreviewDatabaseUrl(valid, previewRef, productionRef).sessionPooler,
    true,
  );
  assert.throws(
    () => validatePreviewDatabaseUrl(
      `postgresql://postgres:secret@db.${previewRef}.supabase.co:5432/postgres`,
      previewRef,
      productionRef,
    ),
    /Session pooler host/,
  );
  assert.throws(
    () => validatePreviewDatabaseUrl(
      `postgresql://postgres.${previewRef}:secret@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
      previewRef,
      productionRef,
    ),
    /port 5432/,
  );
  assert.throws(
    () => validatePreviewDatabaseUrl(
      `postgresql://postgres.${productionRef}:secret@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`,
      previewRef,
      productionRef,
    ),
    /username must be scoped/,
  );
  assert.throws(
    () => validatePreviewDatabaseUrl(
      `postgresql://postgres.${previewRef}:%5BYOUR-PASSWORD%5D@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`,
      previewRef,
      productionRef,
    ),
    /password placeholder/,
  );
  assert.throws(
    () => validatePreviewDatabaseUrl(valid, previewRef, previewRef),
    /must be present and different/,
  );

  console.log('Preview database URL contract self-test passed.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  validatePreviewDatabaseUrl(
    requiredEnv('P03_PREVIEW_DATABASE_URL'),
    requiredEnv('P03_PREVIEW_PROJECT_REF'),
    requiredEnv('P03_PRODUCTION_PROJECT_REF'),
  );
  console.log('Preview database URL contract passed.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Preview database URL validation failed.';
    console.error(`Preview database URL contract failed: ${message}`);
    process.exitCode = 1;
  }
}
