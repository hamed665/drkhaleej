import "server-only";

export const IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION =
  "drkhaleej.import.publishAudit.v2" as const;

export const IMPORT_LEGACY_RESERVATION_AUDIT_EVENT = "execution_started" as const;
export const IMPORT_RESERVATION_CREATED_AUDIT_EVENT = "reservation_created" as const;

export type ImportReservationAuditEvent =
  | typeof IMPORT_LEGACY_RESERVATION_AUDIT_EVENT
  | typeof IMPORT_RESERVATION_CREATED_AUDIT_EVENT;

export function isCompatibleReservationAudit(input: {
  eventType: ImportReservationAuditEvent;
  schemaVersion: string;
  phase: string | null;
}): boolean {
  if (input.phase !== "reservation") return false;
  if (typeof input.schemaVersion !== "string") return false;

  if (input.eventType === IMPORT_RESERVATION_CREATED_AUDIT_EVENT) {
    return input.schemaVersion === IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION;
  }

  return input.schemaVersion.trim().length > 0 &&
    input.schemaVersion !== IMPORT_RESERVATION_AUDIT_SCHEMA_VERSION;
}
