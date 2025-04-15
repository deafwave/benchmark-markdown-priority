import fs from 'fs';
import path from 'path';
import { CsvRecord, dataDir, parseCsv, subdirectories } from './utils';

describe('CSV Data Validation', () => {
    if (subdirectories.length === 0) {
        it('should find subdirectories in the data folder', () => {
            expect(subdirectories.length).toBeGreaterThan(0);
        });
        return;
    }

    subdirectories.forEach(subDir => {
        describe(`Directory: ${subDir}`, () => {
            const dirPath = path.join(dataDir, subDir);
            const fileOnePath = path.join(dirPath, 'one.csv');
            const fileTwoPath = path.join(dirPath, 'two.csv');

            let dataOne: CsvRecord[];
            let dataTwo: CsvRecord[];
            let parsingError = false;

            beforeAll(() => {
                // Check file existence before parsing
                if (!fs.existsSync(fileOnePath)) {
                    throw new Error(`one.csv not found in ${subDir}`);
                }
                if (!fs.existsSync(fileTwoPath)) {
                    throw new Error(`two.csv not found in ${subDir}`);
                }
                // Parse files once before running tests for this directory
                try {
                    dataOne = parseCsv(fileOnePath);
                    dataTwo = parseCsv(fileTwoPath);
                } catch (error: any) {
                    parsingError = true;
                    // Rethrow to fail the test setup if parsing fails critically
                     throw new Error(`Failed to parse CSV files in ${subDir}: ${error.message}`);
                 }
            });

             it('should parse successfully', () => {
                // This test primarily confirms beforeAll didn't throw for this suite
                expect(parsingError).toBe(false);
            });

            it('should contain exactly 83 lines in both one.csv and two.csv', () => {
                 expect(dataOne).toHaveLength(83);
                 expect(dataTwo).toHaveLength(83);
            });

            it('should have consistent weights for corresponding line numbers', () => {
                const mapOne = new Map<number, number>();
                const mapTwo = new Map<number, number>();

                // Populate maps and check for duplicates/invalid line numbers
                dataOne.forEach(record => {
                    expect(Number.isInteger(record.lineNumber)).toBe(true);
                    expect(record.lineNumber).toBeGreaterThan(0);
                     expect(mapOne.has(record.lineNumber)).toBe(false); // Check for duplicates
                    mapOne.set(record.lineNumber, record.weight);
                });
                dataTwo.forEach(record => {
                    expect(Number.isInteger(record.lineNumber)).toBe(true);
                    expect(record.lineNumber).toBeGreaterThan(0);
                     expect(mapTwo.has(record.lineNumber)).toBe(false); // Check for duplicates
                    mapTwo.set(record.lineNumber, record.weight);
                 });

                // Verify all line numbers from 1 to 83 exist and weights match
                for (let i = 1; i <= 83; i++) {
                     const weightOne = mapOne.get(i);
                    const weightTwo = mapTwo.get(i);

                    expect(weightOne).toBeDefined(); // Check if line number exists
                     expect(weightTwo).toBeDefined(); // Check if line number exists

                    expect(weightOne).toEqual(weightTwo); // Check for weight consistency
                }

                 // Ensure no unexpected line numbers (e.g., > 83)
                expect(mapOne.size).toEqual(83);
                 expect(mapTwo.size).toEqual(83);
            });
        });
    });
}); 