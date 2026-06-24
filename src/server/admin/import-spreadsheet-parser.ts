import "server-only";

import { inflateRawSync } from "node:zlib";

export type ParsedCellValue = string | number | boolean | null;

export type ParsedImportSpreadsheetRow = {
  sheetName: string;
  rowNumber: number;
  values: Record<string, ParsedCellValue>;
};

export type ParsedImportSpreadsheet = {
  workbookKind: "xlsx" | "csv" | "tsv";
  sheets: string[];
  rows: ParsedImportSpreadsheetRow[];
};

type ZipEntry = {
  fileName: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

type WorkbookSheetRef = {
  name: string;
  relationshipId: string;
};

const textDecoder = new TextDecoder("utf-8");
const maxXmlCharacters = 8_000_000;

export function parseImportSpreadsheet(
  bytes: Uint8Array,
  fileName: string,
): ParsedImportSpreadsheet {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".xlsx")) {
    return parseXlsxSpreadsheet(bytes);
  }

  const text = textDecoder.decode(bytes);

  if (lowerName.endsWith(".tsv")) {
    return parseDelimitedSpreadsheet(text, "\t", "tsv", "Sheet1");
  }

  return parseDelimitedSpreadsheet(text, ",", "csv", "Sheet1");
}

function parseXlsxSpreadsheet(bytes: Uint8Array): ParsedImportSpreadsheet {
  const workbookBuffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entries = readZipEntries(workbookBuffer);
  const fileMap = new Map<string, Buffer>();

  for (const entry of entries) {
    if (!entry.fileName.endsWith(".xml") && !entry.fileName.endsWith(".rels")) continue;
    fileMap.set(entry.fileName, readZipEntry(workbookBuffer, entry));
  }

  const workbookXml = readTextFile(fileMap, "xl/workbook.xml");
  const workbookRelsXml = readTextFile(fileMap, "xl/_rels/workbook.xml.rels");
  const sharedStringsXml = fileMap.has("xl/sharedStrings.xml")
    ? readTextFile(fileMap, "xl/sharedStrings.xml")
    : null;

  const sharedStrings = sharedStringsXml === null ? [] : parseSharedStrings(sharedStringsXml);
  const sheets = parseWorkbookSheets(workbookXml);
  const relationships = parseWorkbookRelationships(workbookRelsXml);
  const rows: ParsedImportSpreadsheetRow[] = [];

  for (const sheet of sheets) {
    const target = relationships.get(sheet.relationshipId);
    if (target === undefined) continue;

    const path = normalizeWorkbookTargetPath(target);
    const sheetXml = readTextFile(fileMap, path);
    rows.push(...parseWorksheetRows(sheetXml, sheet.name, sharedStrings));
  }

  return {
    workbookKind: "xlsx",
    sheets: sheets.map((sheet) => sheet.name),
    rows,
  };
}

function readTextFile(fileMap: Map<string, Buffer>, path: string): string {
  const content = fileMap.get(path);
  if (content === undefined) {
    throw new Error(`Missing required workbook file: ${path}`);
  }

  const text = content.toString("utf8");
  if (text.length > maxXmlCharacters) {
    throw new Error(`Workbook XML file is too large: ${path}`);
  }

  return text;
}

function parseDelimitedSpreadsheet(
  text: string,
  delimiter: string,
  workbookKind: "csv" | "tsv",
  sheetName: string,
): ParsedImportSpreadsheet {
  const table = parseDelimitedRows(text, delimiter);
  const header = table.find((row) => row.some((cell) => cell.trim().length > 0)) ?? [];
  const headerIndex = table.indexOf(header);
  const normalizedHeader = header.map(normalizeHeaderKey);
  const rows: ParsedImportSpreadsheetRow[] = [];

  for (let index = headerIndex + 1; index < table.length; index += 1) {
    const row = table[index];
    if (row === undefined) continue;

    const values: Record<string, ParsedCellValue> = {};

    row.forEach((cell, cellIndex) => {
      const key = normalizedHeader[cellIndex] || `column_${cellIndex + 1}`;
      values[key] = normalizeCellValue(cell);
    });

    if (Object.values(values).some((value) => String(value ?? "").trim().length > 0)) {
      rows.push({ sheetName, rowNumber: index + 1, values });
    }
  }

  return { workbookKind, sheets: [sheetName], rows };
}

function parseDelimitedRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index);
    const next = text.charAt(index + 1);

    if (char === '"') {
      if (insideQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (!insideQuotes && char === delimiter) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!insideQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows;
}

function parseWorkbookSheets(workbookXml: string): WorkbookSheetRef[] {
  const sheets: WorkbookSheetRef[] = [];
  const sheetRegex = /<sheet\b([^>]*)\/?>(?:<\/sheet>)?/gi;
  let match: RegExpExecArray | null;

  while ((match = sheetRegex.exec(workbookXml)) !== null) {
    const attributes = match[1] ?? "";
    const name = readXmlAttribute(attributes, "name");
    const relationshipId = readXmlAttribute(attributes, "r:id");
    if (name !== null && relationshipId !== null) {
      sheets.push({ name: decodeXmlEntities(name), relationshipId });
    }
  }

  return sheets;
}

function parseWorkbookRelationships(relsXml: string): Map<string, string> {
  const relationships = new Map<string, string>();
  const relationshipRegex = /<Relationship\b([^>]*)\/?>(?:<\/Relationship>)?/gi;
  let match: RegExpExecArray | null;

  while ((match = relationshipRegex.exec(relsXml)) !== null) {
    const attributes = match[1] ?? "";
    const id = readXmlAttribute(attributes, "Id");
    const target = readXmlAttribute(attributes, "Target");
    if (id !== null && target !== null) relationships.set(id, target);
  }

  return relationships;
}

function parseSharedStrings(sharedStringsXml: string): string[] {
  const values: string[] = [];
  const itemRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(sharedStringsXml)) !== null) {
    values.push(extractTextRuns(itemMatch[1] ?? ""));
  }

  return values;
}

function parseWorksheetRows(
  worksheetXml: string,
  sheetName: string,
  sharedStrings: string[],
): ParsedImportSpreadsheetRow[] {
  const rawRows = parseWorksheetRowArrays(worksheetXml, sharedStrings);
  const headerRow = rawRows.find((row) => row.cells.some((value) => String(value ?? "").trim().length > 0));
  if (headerRow === undefined) return [];

  const headerIndex = rawRows.indexOf(headerRow);
  const headers = headerRow.cells.map((value, index) => {
    const key = normalizeHeaderKey(String(value ?? ""));
    return key.length > 0 ? key : `column_${index + 1}`;
  });

  const rows: ParsedImportSpreadsheetRow[] = [];

  for (let index = headerIndex + 1; index < rawRows.length; index += 1) {
    const rawRow = rawRows[index];
    if (rawRow === undefined) continue;

    const values: Record<string, ParsedCellValue> = {};

    rawRow.cells.forEach((cell, cellIndex) => {
      values[headers[cellIndex] ?? `column_${cellIndex + 1}`] = cell;
    });

    if (Object.values(values).some((value) => String(value ?? "").trim().length > 0)) {
      rows.push({ sheetName, rowNumber: rawRow.rowNumber, values });
    }
  }

  return rows;
}

function parseWorksheetRowArrays(
  worksheetXml: string,
  sharedStrings: string[],
): { rowNumber: number; cells: ParsedCellValue[] }[] {
  const rows: { rowNumber: number; cells: ParsedCellValue[] }[] = [];
  const rowRegex = /<row\b([^>]*)>([\s\S]*?)<\/row>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(worksheetXml)) !== null) {
    const rowAttributes = rowMatch[1] ?? "";
    const rowContent = rowMatch[2] ?? "";
    const explicitRowNumber = Number(readXmlAttribute(rowAttributes, "r"));
    const rowNumber = Number.isFinite(explicitRowNumber) && explicitRowNumber > 0 ? explicitRowNumber : rows.length + 1;
    const cells: ParsedCellValue[] = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/gi;
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const cellAttributes = cellMatch[1] ?? "";
      const cellContent = cellMatch[2] ?? "";
      const cellRef = readXmlAttribute(cellAttributes, "r");
      const cellType = readXmlAttribute(cellAttributes, "t");
      const columnIndex = cellRef === null ? cells.length : Math.max(columnLettersToIndex(cellRef.replace(/[0-9]/g, "")) - 1, 0);
      cells[columnIndex] = parseCellValue(cellContent, cellType, sharedStrings);
    }

    rows.push({ rowNumber, cells });
  }

  return rows;
}

function parseCellValue(
  cellContent: string,
  cellType: string | null,
  sharedStrings: string[],
): ParsedCellValue {
  if (cellType === "inlineStr") {
    return normalizeCellValue(extractTextRuns(cellContent));
  }

  const valueMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/i.exec(cellContent);
  const rawValue = decodeXmlEntities(valueMatch?.[1] ?? "").trim();

  if (rawValue.length === 0) return null;

  if (cellType === "s") {
    const sharedStringIndex = Number(rawValue);
    return normalizeCellValue(sharedStrings[sharedStringIndex] ?? "");
  }

  if (cellType === "b") return rawValue === "1";
  return normalizeCellValue(rawValue);
}

function extractTextRuns(xml: string): string {
  const runs: string[] = [];
  const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
  let match: RegExpExecArray | null;

  while ((match = textRegex.exec(xml)) !== null) {
    runs.push(decodeXmlEntities(match[1] ?? ""));
  }

  return runs.join("");
}

function normalizeCellValue(value: string): ParsedCellValue {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed) && trimmed.length < 18) {
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
  }

  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  return trimmed;
}

function normalizeHeaderKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\-\/]+/g, "_")
    .replace(/[^a-z0-9_\u0600-\u06ff]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function normalizeWorkbookTargetPath(target: string): string {
  if (target.startsWith("/")) return target.replace(/^\/+/, "");
  if (target.startsWith("xl/")) return target;
  return `xl/${target.replace(/^\.\//, "")}`;
}

function readXmlAttribute(attributes: string, name: string): string | null {
  const escapedName = name.replace(/:/g, "\\:");
  const regex = new RegExp(`${escapedName}=[\"']([^\"']+)[\"']`, "i");
  const match = regex.exec(attributes);
  return match?.[1] ?? null;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function columnLettersToIndex(letters: string): number {
  let value = 0;
  for (const char of letters.toUpperCase()) {
    const code = char.charCodeAt(0);
    if (code < 65 || code > 90) continue;
    value = value * 26 + code - 64;
  }
  return Math.max(value, 1);
}

function readZipEntries(buffer: Buffer): ZipEntry[] {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf8");

    entries.push({ fileName, compressionMethod, compressedSize, localHeaderOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }

  throw new Error("Invalid XLSX ZIP structure.");
}

function readZipEntry(buffer: Buffer, entry: ZipEntry): Buffer {
  const localOffset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
    throw new Error(`Invalid local ZIP header for ${entry.fileName}.`);
  }

  const fileNameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + fileNameLength + extraLength;
  const compressedData = buffer.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) return compressedData;
  if (entry.compressionMethod === 8) return inflateRawSync(compressedData);

  throw new Error(`Unsupported XLSX compression method: ${entry.compressionMethod}`);
}
