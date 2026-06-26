export const DEFAULT_IMPORT_CHUNK_SIZE = 250;
export const MAX_IMPORT_CHUNK_SIZE = 1000;
export const DEFAULT_IMPORT_FIRST_ROW_NUMBER = 2;

export type ImportChunkingOptions = {
  chunkSize?: number;
  firstRowNumber?: number;
};

export type ImportChunk<T> = {
  index: number;
  startRowNumber: number;
  endRowNumber: number;
  size: number;
  totalRows: number;
  rows: readonly T[];
};

export type ImportProcessingPlan<T> = {
  totalRows: number;
  chunkSize: number;
  chunkCount: number;
  firstRowNumber: number;
  chunks: readonly ImportChunk<T>[];
};

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.floor(value);
}

export function resolveImportChunkSize(chunkSize?: number): number {
  const normalizedChunkSize = normalizePositiveInteger(chunkSize, DEFAULT_IMPORT_CHUNK_SIZE);

  if (normalizedChunkSize < 1) {
    return DEFAULT_IMPORT_CHUNK_SIZE;
  }

  return Math.min(normalizedChunkSize, MAX_IMPORT_CHUNK_SIZE);
}

export function resolveImportFirstRowNumber(firstRowNumber?: number): number {
  const normalizedFirstRowNumber = normalizePositiveInteger(firstRowNumber, DEFAULT_IMPORT_FIRST_ROW_NUMBER);

  return Math.max(1, normalizedFirstRowNumber);
}

export function chunkImportRows<T>(rows: readonly T[], options: ImportChunkingOptions = {}): ImportChunk<T>[] {
  const chunkSize = resolveImportChunkSize(options.chunkSize);
  const firstRowNumber = resolveImportFirstRowNumber(options.firstRowNumber);
  const chunks: ImportChunk<T>[] = [];

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunkRows = rows.slice(offset, offset + chunkSize);
    const startRowNumber = firstRowNumber + offset;
    const endRowNumber = startRowNumber + chunkRows.length - 1;

    chunks.push({
      index: chunks.length,
      startRowNumber,
      endRowNumber,
      size: chunkRows.length,
      totalRows: rows.length,
      rows: chunkRows
    });
  }

  return chunks;
}

export function createImportProcessingPlan<T>(rows: readonly T[], options: ImportChunkingOptions = {}): ImportProcessingPlan<T> {
  const chunkSize = resolveImportChunkSize(options.chunkSize);
  const firstRowNumber = resolveImportFirstRowNumber(options.firstRowNumber);
  const chunks = chunkImportRows(rows, { chunkSize, firstRowNumber });

  return {
    totalRows: rows.length,
    chunkSize,
    chunkCount: chunks.length,
    firstRowNumber,
    chunks
  };
}
