import { describe, expect, it } from 'vitest';
import {
  processCsvFile,
  previewCsvFile,
  exportReportToCsv
} from '../../src/services/BatchService.js';
import type { BatchReport } from '../../src/shared/types.js';

function csvFile(content: string, name = 'names.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

describe('BatchService.processCsvFile', () => {
  describe('hasHeader', () => {
    it('defaults to true: skips a real header row and processes the rest', async () => {
      const file = csvFile('name\nAbū Bakr\nʿUmar\n');
      const report = await processCsvFile(file);
      expect(report.totalRows).toBe(2);
      expect(report.rows[0]?.input).toBe('Abū Bakr');
      expect(report.rows[1]?.input).toBe('ʿUmar');
    });

    it('hasHeader: false does not drop the first row of a headerless file', async () => {
      const file = csvFile('Abū Bakr\nʿUmar\nʿAlī\n');
      const report = await processCsvFile(file, { hasHeader: false });
      expect(report.totalRows).toBe(3);
      expect(report.rows.map((r) => r.input)).toEqual(['Abū Bakr', 'ʿUmar', 'ʿAlī']);
    });

    it('without hasHeader: false, a headerless file loses its first name (documents the pre-fix bug for contrast)', async () => {
      const file = csvFile('Abū Bakr\nʿUmar\nʿAlī\n');
      const report = await processCsvFile(file); // hasHeader defaults to true
      expect(report.totalRows).toBe(2);
      expect(report.rows.map((r) => r.input)).toEqual(['ʿUmar', 'ʿAlī']);
      // "Abū Bakr" was consumed as a (nonexistent) header row and is gone —
      // this is why callers processing headerless files MUST pass hasHeader: false.
    });

    it('resolves a named column against the header row', async () => {
      const file = csvFile('id,fullname\n1,Abū Bakr\n2,ʿUmar\n');
      const report = await processCsvFile(file, { column: 'fullname' });
      expect(report.rows.map((r) => r.input)).toEqual(['Abū Bakr', 'ʿUmar']);
    });

    it('rejects a named column when hasHeader is false (no header row to match against)', async () => {
      const file = csvFile('Abū Bakr\nʿUmar\n');
      await expect(processCsvFile(file, { column: 'fullname', hasHeader: false })).rejects.toThrow(
        /header row/i
      );
    });
  });

  describe('onProgress', () => {
    it('reports the true total row count, not the same value as processed', async () => {
      const file = csvFile('name\nAbū Bakr\nʿUmar\nʿAlī\n');
      const calls: Array<[number, number]> = [];
      await processCsvFile(file, {
        onProgress: (processed, total) => calls.push([processed, total])
      });

      expect(calls).toHaveLength(3);
      // Regression: previously called as onProgress(rowIndex, rowIndex), so
      // total === processed on every single call, making any processed/total
      // percentage jump straight to 100% after the first row.
      for (const [processed, total] of calls) {
        expect(total).toBe(3);
        expect(processed).toBeLessThanOrEqual(3);
      }
      expect(calls.map(([p]) => p)).toEqual([1, 2, 3]);
    });

    it('total reflects data rows only (header already excluded)', async () => {
      const file = csvFile('name\nAbū Bakr\nʿUmar\n');
      const totals: number[] = [];
      await processCsvFile(file, { onProgress: (_p, total) => totals.push(total) });
      expect(new Set(totals)).toEqual(new Set([2]));
    });
  });

  describe('empty cells', () => {
    it('skips empty cells by default and counts them separately', async () => {
      const file = csvFile('name\nAbū Bakr\n\n ,\nʿUmar\n');
      const report = await processCsvFile(file, { column: 0 });
      expect(report.successCount).toBe(2);
    });
  });

  describe('errors', () => {
    it('records a row error without aborting the whole batch', async () => {
      // The middle row's name column is empty but the line itself isn't
      // blank (it has a non-empty second column), so Papa Parse's
      // skipEmptyLines doesn't drop it — with skipEmpty: false this reaches
      // transliterationService.convert('') and throws a real error.
      const file = csvFile('name,notes\nAbū Bakr,ok\n,missing name\nʿUmar,ok\n');
      const report = await processCsvFile(file, { column: 0, skipEmpty: false });
      expect(report.rows.map((r) => r.status)).toEqual(['ok', 'error', 'ok']);
      expect(report.errorCount).toBe(1);
      expect(report.successCount).toBe(2);
    });
  });
});

describe('BatchService.previewCsvFile', () => {
  it('returns the header row, sample rows, and detected column with no warnings for a clean file', async () => {
    const file = csvFile('id,name\n1,Abū Bakr\n2,ʿUmar\n');
    const preview = await previewCsvFile(file, { column: 'name' });
    expect(preview.headerRow).toEqual(['id', 'name']);
    expect(preview.sampleRows).toEqual([
      ['1', 'Abū Bakr'],
      ['2', 'ʿUmar']
    ]);
    expect(preview.totalDataRows).toBe(2);
    expect(preview.columnIndex).toBe(1);
    expect(preview.warnings).toEqual([]);
  });

  it('warns on an empty file', async () => {
    const file = csvFile('');
    const preview = await previewCsvFile(file);
    expect(preview.warnings.map((w) => w.code)).toContain('empty-file');
  });

  it('warns when there are no data rows (header only)', async () => {
    const file = csvFile('name\n');
    const preview = await previewCsvFile(file);
    expect(preview.warnings.map((w) => w.code)).toContain('no-data-rows');
  });

  it('warns when the requested named column is not in the header', async () => {
    const file = csvFile('id,fullname\n1,Abū Bakr\n');
    const preview = await previewCsvFile(file, { column: 'nope' });
    expect(preview.warnings.map((w) => w.code)).toContain('column-not-found');
  });

  it('warns when only a single column is detected', async () => {
    const file = csvFile('name\nAbū Bakr\nʿUmar\n');
    const preview = await previewCsvFile(file);
    expect(preview.warnings.map((w) => w.code)).toContain('single-column-detected');
  });

  it('warns when the requested column index is out of range', async () => {
    const file = csvFile('id,fullname\n1,Abū Bakr\n');
    const preview = await previewCsvFile(file, { column: 5 });
    expect(preview.warnings.map((w) => w.code)).toContain('column-out-of-range');
  });

  it('does not process any rows (preview is read-only)', async () => {
    const file = csvFile('name\nAbū Bakr\n');
    const preview = await previewCsvFile(file);
    expect(preview).not.toHaveProperty('rows');
  });
});

describe('BatchService.exportReportToCsv', () => {
  it('renders ok/error/skipped rows with the expected columns', () => {
    const report: BatchReport = {
      totalRows: 3,
      successCount: 1,
      errorCount: 1,
      skippedCount: 1,
      processedAt: new Date().toISOString(),
      rows: [
        {
          status: 'ok',
          input: 'Abū Bakr',
          rowIndex: 1,
          output: {
            input: 'Abū Bakr',
            normalizedName: 'Abū Bakr',
            nameOrder: 'Abu Bakr',
            arabic: 'ابو بكر',
            arabicHarakat: 'أَبُو بَكْر',
            brillLatin: 'Abū Bakr',
            dinLatin: 'Abū Bakr',
            scheme: 'brill',
            direction: 'latin-to-arabic',
            ruleVersion: 'test',
            timestamp: new Date().toISOString()
          }
        },
        { status: 'error', input: 'bad', rowIndex: 2, error: 'boom' },
        { status: 'skipped', input: '', rowIndex: 3, reason: 'empty cell' }
      ]
    };
    const csv = exportReportToCsv(report);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('row,input,arabic_harakat,arabic,name_order,status,error');
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain('"أَبُو بَكْر"');
    expect(lines[2]).toContain('error');
    expect(lines[3]).toContain('skipped');
  });
});
