import "server-only";

export type ImportPublishPersistenceTable =
  | "import_publish_idempotency_records"
  | "import_publish_rollback_snapshots"
  | "import_publish_audit_events";

export type ImportPublishPersistenceBlocker =
  | "migration_missing"
  | "idempotency_table_missing"
  | "rollback_table_missing"
  | "audit_table_missing"
  | "rls_missing"
  | "public_policy_present"
  | "idempotency_uniqueness_missing"
  | "retention_constraint_missing"
  | "hash_constraint_missing"
  | "audit_chain_restrict_missing";

export type ImportPublishPersistenceSchemaInput = {
  migrationPresent: boolean;
  availableTables: readonly ImportPublishPersistenceTable[];
  rlsEnabledTables: readonly ImportPublishPersistenceTable[];
  publicPolicyPresent: boolean;
  idempotencyUnique: boolean;
  retentionConstraintsPresent: boolean;
  hashConstraintsPresent: boolean;
  auditChainDeleteRestricted: boolean;
};

export type ImportPublishPersistenceSchemaReadiness = {
  schemaReady: boolean;
  executionReady: false;
  mutationEnabled: false;
  bulkAllowed: false;
  blockers: readonly ImportPublishPersistenceBlocker[];
  requiredTables: readonly ImportPublishPersistenceTable[];
};

export const IMPORT_PUBLISH_PERSISTENCE_REQUIRED_TABLES = [
  "import_publish_idempotency_records",
  "import_publish_rollback_snapshots",
  "import_publish_audit_events",
] as const satisfies readonly ImportPublishPersistenceTable[];

export function getImportPublishPersistenceSchemaReadiness(
  input: ImportPublishPersistenceSchemaInput,
): ImportPublishPersistenceSchemaReadiness {
  const blockers: ImportPublishPersistenceBlocker[] = [];
  if (!input.migrationPresent) blockers.push("migration_missing");
  if (!input.availableTables.includes("import_publish_idempotency_records")) blockers.push("idempotency_table_missing");
  if (!input.availableTables.includes("import_publish_rollback_snapshots")) blockers.push("rollback_table_missing");
  if (!input.availableTables.includes("import_publish_audit_events")) blockers.push("audit_table_missing");
  if (IMPORT_PUBLISH_PERSISTENCE_REQUIRED_TABLES.some((table) => !input.rlsEnabledTables.includes(table))) blockers.push("rls_missing");
  if (input.publicPolicyPresent) blockers.push("public_policy_present");
  if (!input.idempotencyUnique) blockers.push("idempotency_uniqueness_missing");
  if (!input.retentionConstraintsPresent) blockers.push("retention_constraint_missing");
  if (!input.hashConstraintsPresent) blockers.push("hash_constraint_missing");
  if (!input.auditChainDeleteRestricted) blockers.push("audit_chain_restrict_missing");

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    schemaReady: uniqueBlockers.length === 0,
    executionReady: false,
    mutationEnabled: false,
    bulkAllowed: false,
    blockers: uniqueBlockers,
    requiredTables: IMPORT_PUBLISH_PERSISTENCE_REQUIRED_TABLES,
  };
}

export function isImportPublishPersistenceSchemaReady(
  input: ImportPublishPersistenceSchemaInput,
): boolean {
  return getImportPublishPersistenceSchemaReadiness(input).schemaReady;
}
