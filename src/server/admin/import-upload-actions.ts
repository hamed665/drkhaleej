"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";
import {
  parseImportSpreadsheet,
  type ParsedCellValue,
  type ParsedImportSpreadsheet,
  type ParsedImportSpreadsheetRow,
} from "@/server/admin/import-spreadsheet-parser";
import type { AdminImportEntityType } from "@/server/admin/imports";

type ImportTemplateKey = "doctor_profile_v3" | "pharmacy_v1" | "hospital_v1";

type JsonPrimitive = ParsedCellValue;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = Record<string, JsonValue>;

type MutationResult<T> = { data: T[] | null; error: unknown | null };
type SingleMutationResult<T> = { data: T | null; error: unknown | null };

type MutationBuilder<T> = PromiseLike<MutationResult<T>> & {
  insert(values: JsonRecord | JsonRecord[]): MutationBuilder<T>;
  update(values: JsonRecord): MutationBuilder<T>;
  select(columns: string): MutationBuilder<T>;
  eq(column: string, value: string | number | boolean): MutationBuilder<T>;
  maybeSingle(): Promise<SingleMutationResult<T>>;
};

type ImportMutationClient = {
  from<T extends object>(table: string): MutationBuilder<T>;
};

type InsertedBatch = { id: string };
type InsertedFile = { id: string };

type RowValidationResult = {
  score: number;
  status: "parsed" | "validation_failed";
  issues: Array<{
    severity: "info" | "warning" | "error" | "critical";
    fieldName: string | null;
    code: string;
    message: string;
    suggestedFix: string | null;
  }>;
};

export type ImportUploadState = {
  ok: boolean;
  message: string | null;
  batchId?: string;
  totalRows?: number;
  validRows?: number;
  invalidRows?: number;
};

const maxUploadBytes = 5 * 1024 * 1024;
const maxParsedRows = 500;

const templateConfigs: Record<
  ImportTemplateKey,
  {
    label: string;
    entityType: AdminImportEntityType;
    masterSheetHints: readonly string[];
    nameKeys: readonly string[];
    sourceKeys: readonly string[];
    externalIdKeys: readonly string[];
  }
> = {
  doctor_profile_v3: {
    label: "Doctor Profile v3",
    entityType: "doctor",
    masterSheetHints: ["doctors", "doctor_master", "doctor_profile_enrichment"],
    nameKeys: ["full_name_en", "full_name_ar", "display_name_en", "display_name_ar", "doctor_name_en", "doctor_name_ar"],
    sourceKeys: ["source_url", "source_name", "data_source", "license_source"],
    externalIdKeys: ["doctor_external_id", "external_id", "doctor_id"],
  },
  pharmacy_v1: {
    label: "Pharmacy v1",
    entityType: "pharmacy",
    masterSheetHints: ["pharmacy_master", "pharmacies"],
    nameKeys: ["pharmacy_name_en", "pharmacy_name_ar", "name_en", "name_ar", "display_name_en", "display_name_ar"],
    sourceKeys: ["source_url", "source_name", "data_source", "license_source"],
    externalIdKeys: ["pharmacy_external_id", "external_id", "pharmacy_id"],
  },
  hospital_v1: {
    label: "Hospital v1",
    entityType: "hospital",
    masterSheetHints: ["hospital_master", "hospitals"],
    nameKeys: ["hospital_name_en", "hospital_name_ar", "name_en", "name_ar", "display_name_en", "display_name_ar"],
    sourceKeys: ["source_url", "source_name", "data_source", "license_source", "accreditation_source"],
    externalIdKeys: ["hospital_external_id", "external_id", "hospital_id"],
  },
};

function failure(message: string): ImportUploadState {
  return { ok: false, message };
}

function createImportMutationClient(): ImportMutationClient {
  return createSupabaseServiceRoleClient() as unknown as ImportMutationClient;
}

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isTemplateKey(value: string | null): value is ImportTemplateKey {
  return value === "doctor_profile_v3" || value === "pharmacy_v1" || value === "hospital_v1";
}

function isSupportedFileName(fileName: string): boolean {
  return /\.(xlsx|csv|tsv)$/i.test(fileName);
}

function fileExtension(fileName: string): "excel" | "csv" | "other" {
  if (/\.xlsx$/i.test(fileName)) return "excel";
  if (/\.(csv|tsv)$/i.test(fileName)) return "csv";
  return "other";
}

function fileHash(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeText(value: JsonPrimitive | undefined): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function findFirstValue(values: Record<string, JsonPrimitive>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = normalizeText(values[key]);
    if (value !== null) return value;
  }
  return null;
}

function inferExternalId(
  row: ParsedImportSpreadsheetRow,
  templateKey: ImportTemplateKey,
): string | null {
  return findFirstValue(row.values, templateConfigs[templateKey].externalIdKeys);
}

function inferSourceUrl(row: ParsedImportSpreadsheetRow): string | null {
  return findFirstValue(row.values, ["source_url", "website_url", "license_source_url", "google_maps_url"]);
}

function inferLastChecked(row: ParsedImportSpreadsheetRow): string | null {
  const value = row.values.last_checked_at ?? row.values.last_checked ?? row.values.last_verified_at;
  if (typeof value === "number" && value > 20_000 && value < 80_000) {
    const baseDate = new Date(Date.UTC(1899, 11, 30));
    baseDate.setUTCDate(baseDate.getUTCDate() + value);
    return baseDate.toISOString().slice(0, 10);
  }

  const text = normalizeText(value);
  if (text === null) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsedDate = new Date(text);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate.toISOString().slice(0, 10);

  return null;
}

function isMasterSheet(sheetName: string, templateKey: ImportTemplateKey): boolean {
  const normalizedSheetName = sheetName.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return templateConfigs[templateKey].masterSheetHints.some((hint) => normalizedSheetName.includes(hint));
}

function validateParsedRow(
  row: ParsedImportSpreadsheetRow,
  templateKey: ImportTemplateKey,
): RowValidationResult {
  const config = templateConfigs[templateKey];
  const issues: RowValidationResult["issues"] = [];
  let score = 15;

  const externalId = findFirstValue(row.values, config.externalIdKeys);
  const name = findFirstValue(row.values, config.nameKeys);
  const source = findFirstValue(row.values, config.sourceKeys);
  const lastChecked = inferLastChecked(row);
  const contact = findFirstValue(row.values, [
    "phone_e164",
    "phone_display",
    "primary_phone",
    "whatsapp_e164",
    "whatsapp_phone",
    "google_maps_url",
    "generated_direction_url",
    "latitude",
    "longitude",
  ]);

  if (externalId !== null) score += 20;
  if (name !== null) score += 25;
  if (source !== null) score += 15;
  if (lastChecked !== null) score += 10;
  if (contact !== null) score += 15;

  if (isMasterSheet(row.sheetName, templateKey) && name === null) {
    issues.push({
      severity: "error",
      fieldName: config.nameKeys[0] ?? null,
      code: "missing_master_name",
      message: `${config.label} master rows need a public name before review or publishing can continue.`,
      suggestedFix: "Fill at least one English or Arabic display/name column for this master row.",
    });
  }

  if (source === null) {
    issues.push({
      severity: "warning",
      fieldName: "source_url",
      code: "missing_source",
      message: "No source URL or source name was detected for this row.",
      suggestedFix: "Add source_url or source_name so the import remains auditable.",
    });
  }

  if (lastChecked === null) {
    issues.push({
      severity: "warning",
      fieldName: "last_checked_at",
      code: "missing_last_checked",
      message: "No valid last_checked_at value was detected.",
      suggestedFix: "Use YYYY-MM-DD for last_checked_at whenever possible.",
    });
  }

  if (externalId === null) {
    issues.push({
      severity: "info",
      fieldName: config.externalIdKeys[0] ?? null,
      code: "missing_external_id",
      message: "No stable external ID was detected for this row.",
      suggestedFix: "Add a stable external ID to improve duplicate detection in later phases.",
    });
  }

  const hasHardError = issues.some((issue) => issue.severity === "error" || issue.severity === "critical");
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return {
    score: normalizedScore,
    status: hasHardError || normalizedScore < 40 ? "validation_failed" : "parsed",
    issues,
  };
}

function toJsonRecord(values: Record<string, JsonPrimitive>): JsonRecord {
  const record: JsonRecord = {};
  for (const [key, value] of Object.entries(values)) {
    record[key] = value;
  }
  return record;
}

export async function uploadImportSpreadsheet(
  _previousState: ImportUploadState,
  formData: FormData,
): Promise<ImportUploadState> {
  const admin = await requireAdminPermission("imports.upload");
  const templateKey = readFormString(formData, "templateKey");
  const batchName = readFormString(formData, "batchName");
  const sourceName = readFormString(formData, "sourceName");
  const fileValue = formData.get("importFile");

  if (!isTemplateKey(templateKey)) {
    return failure("Choose a supported import template before uploading.");
  }

  if (batchName === null || batchName.length > 180) {
    return failure("Batch name is required and must be under 180 characters.");
  }

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return failure("Choose an Excel, CSV, or TSV file to upload.");
  }

  if (fileValue.size > maxUploadBytes) {
    return failure("Import file is too large. Keep this phase under 5 MB per upload.");
  }

  if (!isSupportedFileName(fileValue.name)) {
    return failure("Only .xlsx, .csv, and .tsv files are supported in this phase.");
  }

  const config = templateConfigs[templateKey];
  const bytes = new Uint8Array(await fileValue.arrayBuffer());
  const hash = fileHash(bytes);
  let parsed: ParsedImportSpreadsheet;

  try {
    parsed = parseImportSpreadsheet(bytes, fileValue.name);
  } catch {
    return failure("The uploaded file could not be parsed. Confirm the template is not corrupted and try again.");
  }

  if (parsed.rows.length === 0) {
    return failure("No data rows were detected in the uploaded file.");
  }

  const limitedRows = parsed.rows.slice(0, maxParsedRows);
  const supabase = createImportMutationClient();
  const batchInsert: JsonRecord = {
    batch_name: batchName,
    entity_type: config.entityType,
    source_type: fileExtension(fileValue.name),
    source_name: sourceName,
    file_name: fileValue.name,
    file_hash: hash,
    status: "parsing",
    total_rows: parsed.rows.length,
    metadata: {
      template_key: templateKey,
      workbook_kind: parsed.workbookKind,
      sheet_names: parsed.sheets,
      parser_limit_rows: maxParsedRows,
      parser_row_limit_applied: parsed.rows.length > maxParsedRows,
    },
  };

  const batchResult = await supabase
    .from<InsertedBatch>("import_batches")
    .insert(batchInsert)
    .select("id")
    .maybeSingle();

  if (batchResult.error !== null || batchResult.data === null) {
    return failure("Import batch could not be created.");
  }

  const batchId = batchResult.data.id;

  const fileResult = await supabase
    .from<InsertedFile>("import_files")
    .insert({
      batch_id: batchId,
      uploaded_by_profile_id: admin.profile.id,
      file_name: fileValue.name,
      file_hash: hash,
      template_key: templateKey,
      mime_type: fileValue.type || null,
      row_count: parsed.rows.length,
      status: "parsed",
      metadata: {
        workbook_kind: parsed.workbookKind,
        sheet_names: parsed.sheets,
        parsed_rows: limitedRows.length,
      },
    })
    .select("id")
    .maybeSingle();

  if (fileResult.error !== null || fileResult.data === null) {
    await supabase
      .from("import_batches")
      .update({ status: "failed", metadata: { failure_reason: "file_registration_failed" } })
      .eq("id", batchId);
    return failure("Import file could not be registered.");
  }

  const importFileId = fileResult.data.id;
  const rowInserts: JsonRecord[] = [];
  const issueInserts: JsonRecord[] = [];
  let validRows = 0;
  let invalidRows = 0;

  for (let index = 0; index < limitedRows.length; index += 1) {
    const row = limitedRows[index];
    if (row === undefined) continue;

    const rawRowId = randomUUID();
    const validation = validateParsedRow(row, templateKey);

    if (validation.status === "parsed") validRows += 1;
    else invalidRows += 1;

    rowInserts.push({
      id: rawRowId,
      batch_id: batchId,
      import_file_id: importFileId,
      row_number: index + 1,
      entity_type: config.entityType,
      external_id: inferExternalId(row, templateKey),
      raw_payload: {
        sheet_name: row.sheetName,
        source_row_number: row.rowNumber,
        values: toJsonRecord(row.values),
      },
      normalized_payload: {},
      row_status: validation.status,
      validation_score: validation.score,
      source_url: inferSourceUrl(row),
      last_checked_at: inferLastChecked(row),
      metadata: {
        template_key: templateKey,
        workbook_kind: parsed.workbookKind,
      },
    });

    for (const issue of validation.issues) {
      issueInserts.push({
        batch_id: batchId,
        raw_row_id: rawRowId,
        severity: issue.severity,
        field_name: issue.fieldName,
        issue_code: issue.code,
        issue_message: issue.message,
        suggested_fix: issue.suggestedFix,
        metadata: { template_key: templateKey, sheet_name: row.sheetName },
      });
    }
  }

  const rowInsertResult = await supabase.from("import_raw_rows").insert(rowInserts);
  if (rowInsertResult.error !== null) {
    await supabase
      .from("import_batches")
      .update({ status: "failed", metadata: { failure_reason: "raw_row_insert_failed" } })
      .eq("id", batchId);
    return failure("Parsed rows could not be stored.");
  }

  if (issueInserts.length > 0) {
    const issueInsertResult = await supabase.from("import_validation_issues").insert(issueInserts);
    if (issueInsertResult.error !== null) {
      await supabase
        .from("import_batches")
        .update({ status: "failed", metadata: { failure_reason: "validation_issue_insert_failed" } })
        .eq("id", batchId);
      return failure("Validation issues could not be stored.");
    }
  }

  const finalStatus = invalidRows > 0 ? "validation_failed" : "parsed";
  const batchUpdateResult = await supabase
    .from("import_batches")
    .update({
      status: finalStatus,
      total_rows: parsed.rows.length,
      valid_rows: validRows,
      invalid_rows: invalidRows,
      ready_for_review_rows: validRows,
      metadata: {
        template_key: templateKey,
        workbook_kind: parsed.workbookKind,
        sheet_names: parsed.sheets,
        parsed_rows: limitedRows.length,
        parser_row_limit_applied: parsed.rows.length > maxParsedRows,
      },
    })
    .eq("id", batchId);

  if (batchUpdateResult.error !== null) {
    return failure("Import batch was parsed, but summary counters could not be updated.");
  }

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.upload",
    action: "import_batch.created",
    entityType: "import_batch",
    entityId: batchId,
    targetTable: "import_batches",
    summary: "Import batch created from uploaded spreadsheet.",
    newValues: {
      templateKey,
      entityType: config.entityType,
      fileName: fileValue.name,
      totalRows: parsed.rows.length,
      parsedRows: limitedRows.length,
      validRows,
      invalidRows,
    },
  });

  await writeAdminAuditEvent({
    admin,
    permissionKey: "imports.upload",
    action: "import_file.registered",
    entityType: "import_file",
    entityId: importFileId,
    targetTable: "import_files",
    summary: "Import file registered after spreadsheet parsing.",
    metadata: { batchId, templateKey, fileHash: hash },
  });

  if (issueInserts.length > 0) {
    await writeAdminAuditEvent({
      admin,
      permissionKey: "imports.validate",
      action: "import_row.validation_recorded",
      entityType: "import_batch",
      entityId: batchId,
      targetTable: "import_validation_issues",
      summary: "Validation issues recorded for import rows.",
      metadata: { issueCount: issueInserts.length, templateKey },
    });
  }

  revalidatePath("/admin/imports");
  revalidatePath(`/admin/imports/${batchId}`);

  return {
    ok: true,
    message:
      invalidRows > 0
        ? "Spreadsheet was parsed into staging with validation issues. Nothing was published."
        : "Spreadsheet was parsed into staging. Nothing was published.",
    batchId,
    totalRows: parsed.rows.length,
    validRows,
    invalidRows,
  };
}
