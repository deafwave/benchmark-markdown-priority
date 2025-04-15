import path from 'path';
import { parse } from 'csv-parse/sync';
import { readdirSync, readFileSync } from 'fs';

export const dataDir = path.join(__dirname, '..', 'data');

export interface CsvRecord {
  lineNumber: number;
  weight: number;
}

export function parseCsv(filePath: string): CsvRecord[] {
  const fileContent = readFileSync(filePath, 'utf-8');
  const records: any[][] = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    cast: true,
    relax_column_count: true,
  });

  return records.map((row, index) => {
    if (row.length !== 2 || typeof row[0] !== 'number' || typeof row[1] !== 'number') {
      const originalLine = fileContent.split(/\r?\n/)[index] || `Row ${index + 1}`;
      throw new Error(`Invalid format or type in ${path.basename(filePath)} at line ${index + 1}: Expected 'number,number', got '${originalLine}'`);
    }
    return { lineNumber: row[0], weight: row[1] };
  });
}

export const subdirectories = readdirSync(dataDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
