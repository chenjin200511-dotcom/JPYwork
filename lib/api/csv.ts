// Purpose: Parses and exports small CSV payloads for manual operations workflows.
import { ApiError } from "./errors";

export type CsvImportResult<T> = {
  failed: number;
  failures: Array<{
    line: number;
    reason: string;
    row: Record<string, string>;
  }>;
  rows: T[];
  succeeded: number;
};

type CsvParseOptions = {
  failOnRowError?: boolean;
  maxRows?: number;
  optionalHeaders?: string[];
  requiredHeaders?: string[];
};

const CSV_FORMAT_MISMATCH_MESSAGE = "格式不匹配，请重新复制";

function csvFormatError() {
  return new ApiError(
    "CSV_FORMAT_MISMATCH",
    CSV_FORMAT_MISMATCH_MESSAGE,
    400,
  );
}

function parseLine(line: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv<T>(
  csv: string,
  mapper: (row: Record<string, string>, line: number) => T,
  options: CsvParseOptions = {},
): CsvImportResult<T> {
  const lines = csv
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length <= 1) {
    throw csvFormatError();
  }

  const headers = parseLine(lines[0]).map((header) => header.trim());
  const requiredHeaders = options.requiredHeaders ?? [];
  const optionalHeaders = options.optionalHeaders ?? [];
  const allowedHeaders = new Set([...requiredHeaders, ...optionalHeaders]);
  const uniqueHeaders = new Set(headers);

  if (
    headers.some((header) => !header) ||
    uniqueHeaders.size !== headers.length ||
    requiredHeaders.some((header) => !uniqueHeaders.has(header)) ||
    (allowedHeaders.size > 0 && headers.some((header) => !allowedHeaders.has(header)))
  ) {
    throw csvFormatError();
  }

  if (options.maxRows && lines.length - 1 > options.maxRows) {
    throw new ApiError(
      "CSV_TOO_LARGE",
      `CSV 一次最多导入 ${options.maxRows} 行`,
      400,
    );
  }

  const rows: T[] = [];
  const failures: CsvImportResult<T>["failures"] = [];

  lines.slice(1).forEach((line, lineIndex) => {
    const values = parseLine(line);

    if (values.length !== headers.length) {
      failures.push({
        line: lineIndex + 2,
        reason: CSV_FORMAT_MISMATCH_MESSAGE,
        row: {},
      });
      return;
    }

    const row = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );

    try {
      rows.push(mapper(row, lineIndex + 2));
    } catch (error) {
      failures.push({
        line: lineIndex + 2,
        reason: error instanceof Error ? error.message : CSV_FORMAT_MISMATCH_MESSAGE,
        row,
      });
    }
  });

  if (failures.length > 0 && options.failOnRowError) {
    throw csvFormatError();
  }

  return {
    failed: failures.length,
    failures,
    rows,
    succeeded: rows.length,
  };
}

function escapeCsvValue(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function exportCsv(headers: string[], rows: Array<Record<string, unknown>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ].join("\n");
}
