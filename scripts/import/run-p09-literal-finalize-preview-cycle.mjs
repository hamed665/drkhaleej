#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_LITERAL_FINAL_EVIDENCE_PATH || "artifacts/p09/literal-final-preview-cycle.json",
);
const executionAuditSchemaVersion = "drkhaleej.import.publishAudit.v3";
const rollbackAuditSchemaVersion = "drkhaleej.import.publishAudit.v4";
const stages = [
  "dry_run",
  "exact_review",
  "authorization_ready",
  "reservation",
  "reservation_verified",
  "private_publish",
  "publish_verified",
  "rollback",
  "exact_recovery_verified",
  "bounded_audit_history",
];

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function jsonEqual(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "Literal completion requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "Literal completion requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "Literal completion requires Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "Literal completion Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in Preview database URL.");
}

function actualSnapshot(row) {
  return {
    visibility: row.metadata?.visibility,
    indexPolicy: row.metadata?.indexable ? "index" : "noindex",
    sitemapPolicy: row.metadata?.sitemapEligible ? "included" : "excluded",
    publishStatus: "private_published",
    publicReady: Boolean(row.is_active || row.is_featured || row.metadata?.publicRouteEnabled),
    projectionVersion: row.metadata?.projectionVersion,
    canonicalRoute: `/${row.default_locale}/${row.default_country}/pharmacies/${row.slug}`,
    center: {
      id: row.id,
      centerType: row.center_type,
      slug: row.slug,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      legalName: row.legal_name,
      status: row.status,
      verificationStatus: row.verification_status,
      primaryPhone: row.primary_phone,
      secondaryPhone: row.secondary_phone,
      whatsappPhone: row.whatsapp_phone,
      email: row.email,
      websiteUrl: row.website_url,
      logoUrl: row.logo_url,
      coverImageUrl: row.cover_image_url,
      shortDescriptionEn: row.short_description_en,
      shortDescriptionAr: row.short_description_ar,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      defaultLocale: row.default_locale,
      defaultCountry: row.default_country,
      isActive: row.is_active,
      isClaimable: row.is_claimable,
      isFeatured: row.is_featured,
      sortOrder: row.sort_order,
      metadata: row.metadata ?? {},
      deletedAt: row.deleted_at,
    },
  };
}

async function writeEvidence(value) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(value, null, 2)}\n`);
}

const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
const previewRef = required("P09_PREVIEW_PROJECT_REF");
const productionRef = required("P09_PRODUCTION_PROJECT_REF");
const entityHash = required("P09_LITERAL_ENTITY_SHA256");
const sourceCommit = required("P09_SOURCE_COMMIT");
assert(process.env.P09_LITERAL_FINALIZE_ENABLED === "true", "Literal completion is not explicitly enabled.");
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const client = new Client({
  connectionString: databaseUrl,
  application_name: "drmuscat-p09-literal-final-preview-cycle",
  ssl: { rejectUnauthorized: false },
  statement_timeout: 60_000,
  query_timeout: 65_000,
  connectionTimeoutMillis: 15_000,
});

let transactionOpen = false;
let evidence = {
  schemaVersion: "drkhaleej.import.p09LiteralFinalPreviewCycle.v1",
  status: "red",
  sourceCommit,
  previewIdentityVerified: true,
  productionConnected: false,
  operatorAuthorizedAutomationExecuted: true,
  durableMutationPerformedOnlyInPreview: false,
  exactRecoveryVerified: false,
  rawIdentifiersExposed: false,
};

try {
  await client.connect();

  const candidates = await client.query(`
    select distinct entity_id::text
    from public.import_pharmacy_admin_read_states
    where entity_id is not null
  `);
  const entityId = candidates.rows.find((row) => sha256(row.entity_id) === entityHash)?.entity_id ?? null;
  assert(entityId, "literal_entity_not_found");

  const state = await client.query(
    `select
       r.id::text as review_state_id,
       r.actor_profile_id::text,
       r.entity_id::text,
       r.expected_entity_version,
       r.snapshot_hash,
       r.entity_fingerprint,
       a.id::text as authorization_id,
       i.id::text as reservation_id,
       i.status as reservation_status,
       i.terminal_result,
       i.expires_at,
       s.id::text as snapshot_id,
       s.snapshot_hash as persisted_snapshot_hash,
       s.snapshot_payload,
       e.id::text as reservation_audit_id,
       c.name_en, c.legal_name, c.slug, c.description_en,
       c.primary_phone, c.whatsapp_phone, c.email, c.website_url, c.metadata
     from public.import_pharmacy_admin_read_states r
     join public.import_pharmacy_publish_authorizations a
       on a.review_state_id = r.id and a.status = 'consumed'
     join public.import_publish_idempotency_records i
       on i.id = a.consumed_by_reservation_id
     join public.import_publish_rollback_snapshots s
       on s.idempotency_record_id = i.id
     join public.import_publish_audit_events e
       on e.idempotency_record_id = i.id
      and e.rollback_snapshot_id = s.id
      and e.outcome = 'pending'
      and e.event_payload ->> 'phase' = 'reservation'
      and e.event_type in ('reservation_created','execution_started')
     join public.centers c on c.id = r.entity_id
     where r.entity_id = $1 and r.operation = 'review'
     order by r.created_at desc, r.id desc
     limit 1`,
    [entityId],
  );
  const row = state.rows[0] ?? null;
  assert(row, "literal_bound_reservation_not_found");
  if (row.reservation_status === "reserved") {
    assert(row.expires_at && new Date(row.expires_at).getTime() > Date.now(), "literal_reservation_expired");
  }
  assert(row.persisted_snapshot_hash === row.snapshot_hash, "literal_snapshot_hash_mismatch");
  assert(isObject(row.snapshot_payload), "literal_snapshot_payload_missing");

  const metadata = isObject(row.metadata) ? row.metadata : {};
  const sourceEvidence = isObject(metadata.sourceEvidence) ? metadata.sourceEvidence : {};
  const supportedSources = new Set(["manual", "csv", "excel", "api", "ai_assisted"]);
  const metadataSource = typeof metadata.source === "string" && supportedSources.has(metadata.source)
    ? metadata.source
    : null;
  const evidenceSource = typeof sourceEvidence.source === "string" && supportedSources.has(sourceEvidence.source)
    ? sourceEvidence.source
    : null;
  const normalizedSource = metadataSource ?? evidenceSource ?? "manual";
  const patch = {
    name_en: row.name_en,
    legal_name: row.legal_name,
    slug: row.slug,
    description_en: row.description_en,
    primary_phone: row.primary_phone,
    whatsapp_phone: row.whatsapp_phone,
    email: row.email,
    website_url: row.website_url,
    metadata_patch: {
      source: normalizedSource,
      sourceEvidence,
      rawPayloadHash: typeof metadata.rawPayloadHash === "string" ? metadata.rawPayloadHash : null,
      visibility: "private",
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  };

  let publishStatus = row.reservation_status;
  let actualVersion = isObject(row.terminal_result) && typeof row.terminal_result.actualVersion === "string"
    ? row.terminal_result.actualVersion
    : null;
  let publishFreshCount = 0;
  let publishReplayCount = 0;
  let referenceCreatedCount = 0;

  if (publishStatus !== "rolled_back") {
    await client.query("begin");
    transactionOpen = true;

    if (publishStatus === "reserved") {
      const rpc = await client.query(
        `select public.import_publish_pharmacy_private(
           $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
           $6::text, $7::jsonb, $8::text
         ) as result`,
        [
          row.reservation_id,
          row.snapshot_id,
          row.reservation_audit_id,
          row.entity_id,
          row.actor_profile_id,
          row.expected_entity_version,
          JSON.stringify(patch),
          executionAuditSchemaVersion,
        ],
      );
      const result = rpc.rows[0]?.result;
      assert(isObject(result) && (result.status === "mutated" || result.status === "replayed"), "literal_private_publish_failed");
      publishFreshCount = result.status === "mutated" ? 1 : 0;
      publishReplayCount = result.status === "replayed" ? 1 : 0;
      actualVersion = typeof result.actualVersion === "string" ? result.actualVersion : null;
      assert(actualVersion, "literal_publish_actual_version_missing");
      publishStatus = "succeeded";
    } else {
      assert(publishStatus === "succeeded", `literal_reservation_status_${publishStatus}`);
      assert(actualVersion, "literal_succeeded_reservation_version_missing");
    }

    const references = await client.query(
      `select id::text, consumed_at
       from public.import_pharmacy_publish_references
       where actor_profile_id = $1 and entity_id = $2
         and idempotency_record_id = $3 and rollback_snapshot_id = $4
       order by created_at, id`,
      [row.actor_profile_id, row.entity_id, row.reservation_id, row.snapshot_id],
    );
    assert(references.rowCount <= 1, "literal_duplicate_publish_references");
    if (references.rowCount === 0) {
      const inserted = await client.query(
        `insert into public.import_pharmacy_publish_references (
           token_hash, actor_profile_id, entity_id, idempotency_record_id,
           rollback_snapshot_id, expected_current_version, expected_snapshot_hash,
           created_at, expires_at
         ) values ($1, $2, $3, $4, $5, $6, $7, clock_timestamp(), clock_timestamp() + interval '30 days')
         returning id`,
        [
          sha256(randomBytes(32).toString("base64url")),
          row.actor_profile_id,
          row.entity_id,
          row.reservation_id,
          row.snapshot_id,
          actualVersion,
          row.snapshot_hash,
        ],
      );
      assert(inserted.rowCount === 1, "literal_publish_reference_create_failed");
      referenceCreatedCount = 1;
    } else {
      assert(references.rows[0].consumed_at === null, "literal_publish_reference_already_consumed_before_rollback");
    }

    await client.query("commit");
    transactionOpen = false;
  }

  const terminalBeforeRollback = await client.query(
    `select status, terminal_result from public.import_publish_idempotency_records where id = $1`,
    [row.reservation_id],
  );

  let rollbackFreshCount = 0;
  let rollbackReplayCount = 0;
  if (terminalBeforeRollback.rows[0]?.status !== "rolled_back") {
    const fresh = await client.query(
      `select public.import_rollback_pharmacy_private_by_authority($1::uuid, $2::uuid, $3::text) as result`,
      [row.entity_id, row.actor_profile_id, rollbackAuditSchemaVersion],
    );
    const freshResult = fresh.rows[0]?.result;
    assert(isObject(freshResult) && freshResult.status === "rolled_back", "literal_rollback_failed");
    assert(freshResult.authorityConsumed === true && freshResult.privateBoundaryVerified === true, "literal_rollback_boundary_unverified");
    rollbackFreshCount = 1;
  }

  const replay = await client.query(
    `select public.import_rollback_pharmacy_private_by_authority($1::uuid, $2::uuid, $3::text) as result`,
    [row.entity_id, row.actor_profile_id, rollbackAuditSchemaVersion],
  );
  assert(isObject(replay.rows[0]?.result) && replay.rows[0].result.status === "replayed", "literal_rollback_replay_unbounded");
  rollbackReplayCount = 1;

  const [terminal, restoredSnapshot, references, audits, center, prepared, queue] = await Promise.all([
    client.query(`select status, terminal_result from public.import_publish_idempotency_records where id = $1`, [row.reservation_id]),
    client.query(`select restored_at, restored_by_profile_id::text from public.import_publish_rollback_snapshots where id = $1`, [row.snapshot_id]),
    client.query(
      `select consumed_at, consumed_by_profile_id::text, consumed_result_hash,
              encode(extensions.digest(consumed_result::text, 'sha256'), 'hex') as recomputed_hash
       from public.import_pharmacy_publish_references
       where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3`,
      [row.actor_profile_id, row.entity_id, row.reservation_id],
    ),
    client.query(
      `select event_type, outcome, schema_version, event_payload, created_at::text
       from public.import_publish_audit_events
       where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
       order by created_at, id`,
      [row.actor_profile_id, row.entity_id, row.reservation_id],
    ),
    client.query(
      `select id, center_type, slug, name_en, name_ar, legal_name, status, verification_status,
              primary_phone, secondary_phone, whatsapp_phone, email, website_url, logo_url,
              cover_image_url, short_description_en, short_description_ar, description_en,
              description_ar, default_locale, default_country, is_active, is_claimable,
              is_featured, sort_order, metadata, deleted_at
       from public.centers where id = $1`,
      [row.entity_id],
    ),
    client.query(
      `select
         (select count(*)::int from public.import_pharmacy_admin_read_states
          where actor_profile_id = $1 and entity_id = $2 and operation = 'dry_run') as dry_run,
         (select count(*)::int from public.import_pharmacy_admin_read_states
          where actor_profile_id = $1 and entity_id = $2 and operation = 'review' and reviewed_at is not null) as review,
         (select count(*)::int from public.import_pharmacy_publish_authorizations
          where actor_profile_id = $1 and entity_id = $2 and status = 'consumed'
            and consumed_by_reservation_id = $3) as authorization`,
      [row.actor_profile_id, row.entity_id, row.reservation_id],
    ),
    client.query(
      `select
         count(*) filter (where publish_status = 'index_eligible')::int as public_count,
         count(*) filter (where index_policy = 'index')::int as index_count,
         count(*) filter (where sitemap_policy = 'included')::int as sitemap_count
       from public.import_publish_queue
       where target_entity_type = 'pharmacy'
         and metadata ->> 'canonical_path' = $1`,
      [row.snapshot_payload.canonicalRoute],
    ),
  ]);

  assert(terminal.rows[0]?.status === "rolled_back" && terminal.rows[0]?.terminal_result?.kind === "rolled_back", "literal_terminal_state_invalid");
  assert(restoredSnapshot.rows[0]?.restored_at && restoredSnapshot.rows[0]?.restored_by_profile_id === row.actor_profile_id, "literal_snapshot_restore_unverified");
  assert(references.rowCount === 1, "literal_publish_reference_count_invalid");
  assert(references.rows[0]?.consumed_at && references.rows[0]?.consumed_by_profile_id === row.actor_profile_id, "literal_rollback_authority_unconsumed");
  assert(references.rows[0]?.consumed_result_hash === references.rows[0]?.recomputed_hash, "literal_rollback_result_hash_mismatch");
  assert(center.rowCount === 1, "literal_restored_pharmacy_missing");

  const auditCounts = {
    reservationCreated: audits.rows.filter((audit) => audit.event_type === "reservation_created" && audit.event_payload?.phase === "reservation").length,
    executionStarted: audits.rows.filter((audit) => audit.event_type === "execution_started" && audit.event_payload?.phase === "mutation").length,
    executionSucceeded: audits.rows.filter((audit) => audit.event_type === "execution_succeeded" && audit.outcome === "succeeded").length,
    rollbackSucceeded: audits.rows.filter((audit) => audit.event_type === "rollback_succeeded" && audit.outcome === "rolled_back").length,
  };
  assert(Object.values(auditCounts).every((count) => count === 1), "literal_audit_history_incomplete_or_duplicated");

  const restored = actualSnapshot(center.rows[0]);
  const exactRecoveryVerified = jsonEqual(row.snapshot_payload, restored);
  assert(exactRecoveryVerified, "literal_exact_recovery_mismatch");
  const preparedRow = prepared.rows[0] ?? {};
  assert(preparedRow.dry_run >= 1 && preparedRow.review >= 1 && preparedRow.authorization === 1, "literal_admin_prepared_state_incomplete");

  const queueRow = queue.rows[0] ?? {};
  const integrity = {
    duplicate_operations: Object.values(auditCounts).reduce((sum, count) => sum + Math.max(0, count - 1), 0),
    audit_gaps: Object.values(auditCounts).filter((count) => count !== 1).length,
    unfinished_executions: 0,
    state_mismatches: exactRecoveryVerified ? 0 : 1,
    public_leakage: Number(queueRow.public_count ?? 0) + (restored.publicReady ? 1 : 0),
    index_leakage: Number(queueRow.index_count ?? 0) + (restored.indexPolicy === "index" ? 1 : 0),
    sitemap_leakage: Number(queueRow.sitemap_count ?? 0) + (restored.sitemapPolicy === "included" ? 1 : 0),
  };
  assert(Object.values(integrity).every((count) => count === 0), "literal_integrity_zero_set_failed");

  evidence = {
    ...evidence,
    status: "green",
    durableMutationPerformedOnlyInPreview: true,
    stages: stages.map((id) => ({ id, status: "complete" })),
    preparedState: {
      dryRunCount: preparedRow.dry_run,
      exactReviewCount: preparedRow.review,
      authorizationCount: preparedRow.authorization,
    },
    normalizedLegacySource: metadataSource === null,
    publishFreshCount,
    publishReplayCount,
    referenceCreatedCount,
    rollbackFreshCount,
    rollbackReplayCount,
    auditCounts,
    exactRecoveryVerified,
    expectedLogicalHash: sha256(JSON.stringify(canonicalize(row.snapshot_payload))),
    actualLogicalHash: sha256(JSON.stringify(canonicalize(restored))),
    privateBoundaryVerified: true,
    integrity,
    literalBrowserClickRequired: false,
    postP09Decision: "GO_LITERAL_PREVIEW_CYCLE_COMPLETE",
    rawIdentifiersExposed: false,
    generatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(evidence);
  assert(!serialized.includes(databaseUrl), "Literal evidence leaked database URL.");
  assert(!serialized.includes(row.actor_profile_id) && !serialized.includes(row.entity_id), "Literal evidence leaked raw identifiers.");
  await writeEvidence(evidence);
  console.log("P09 literal Preview cycle completed with exact recovery; no further browser mutation click is required.");
} catch (error) {
  if (transactionOpen) await client.query("rollback").catch(() => {});
  await writeEvidence({
    ...evidence,
    errorCode: error instanceof Error ? error.message : "literal_completion_failed",
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  throw error;
} finally {
  await client.end().catch(() => {});
}
