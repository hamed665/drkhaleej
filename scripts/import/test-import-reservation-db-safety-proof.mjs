#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  deterministicUuid,
  fixture,
  isTransientConnectionError,
  sanitizeEvidence,
  verifyPreviewIdentity,
} from './run-p03-reservation-db-safety.mjs';

const previewRef = 'previewprojectref1234';
const productionRef = 'productionproject12';

assert.equal(
  verifyPreviewIdentity(
    `postgresql://postgres:secret@db.${previewRef}.supabase.co:5432/postgres`,
    previewRef,
    productionRef,
  ).hostname,
  `db.${previewRef}.supabase.co`,
);
assert.equal(
  verifyPreviewIdentity(
    `postgresql://postgres.${previewRef}:secret@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
    previewRef,
    productionRef,
  ).port,
  '5432',
);
assert.throws(
  () => verifyPreviewIdentity(
    `postgresql://postgres:secret@db.${productionRef}.supabase.co:5432/postgres`,
    previewRef,
    productionRef,
  ),
  /does not match/,
);
assert.throws(
  () => verifyPreviewIdentity(
    `postgresql://postgres:secret@db.${previewRef}.supabase.co:5432/postgres`,
    previewRef,
    previewRef,
  ),
  /must differ/,
);
assert.throws(
  () => verifyPreviewIdentity(
    `postgresql://postgres.${previewRef}:secret@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    previewRef,
    productionRef,
  ),
  /never transaction pooling/,
);

assert.equal(isTransientConnectionError(new Error('Connection terminated')), true);
assert.equal(isTransientConnectionError(Object.assign(new Error('socket'), { code: 'ECONNRESET' })), true);
assert.equal(isTransientConnectionError(Object.assign(new Error('database restart'), { code: '57P01' })), true);
assert.equal(isTransientConnectionError(Object.assign(new Error('connection exception'), { code: '08006' })), true);
assert.equal(isTransientConnectionError(Object.assign(new Error('unique violation'), { code: '23505' })), false);
assert.equal(isTransientConnectionError(new Error('authorization_identity_mismatch')), false);

const firstUuid = deterministicUuid('stable-seed');
assert.match(firstUuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
assert.equal(firstUuid, deterministicUuid('stable-seed'));
assert.notEqual(firstUuid, deterministicUuid('different-seed'));

const firstFixture = fixture('run-id-with-adequate-length', '0123456789abcdef', 'replay');
const repeatedFixture = fixture('run-id-with-adequate-length', '0123456789abcdef', 'replay');
const otherFixture = fixture('run-id-with-adequate-length', '0123456789abcdef', 'concurrency');
assert.deepEqual(firstFixture, repeatedFixture);
assert.notEqual(firstFixture.entityId, otherFixture.entityId);
assert.equal(firstFixture.snapshotPayload.metadata.publicRouteEnabled, null);

assert.match(
  sanitizeEvidence(
    { schemaVersion: 'test', redaction: { rawIdsEmitted: false } },
    [previewRef, productionRef],
  ),
  /"rawIdsEmitted": false/,
);
assert.throws(
  () => sanitizeEvidence({ rawId: firstUuid }, []),
  /raw UUID/,
);
assert.throws(
  () => sanitizeEvidence({ database: 'postgresql:\/\/redacted' }, []),
  /database URL/,
);
assert.throws(
  () => sanitizeEvidence({ project: previewRef }, [previewRef]),
  /forbidden raw identity/,
);

console.log('import reservation DB safety proof tests passed.');
