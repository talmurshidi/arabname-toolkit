import { useEffect, useRef, useState } from 'react';
import { UploadCloud, Download, AlertTriangle } from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import { processCsvFile, previewCsvFile, exportReportToCsv } from '@services/BatchService.js';
import type { BatchPreview, BatchPreviewWarning, BatchReport } from '@shared/types.js';

interface Props {
  strings: UIStrings;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parses the free-text column field into what BatchOptions.column expects. */
function parseColumnField(column: string): string | number | undefined {
  if (column.trim() === '') return undefined;
  const asNumber = Number(column);
  return Number.isNaN(asNumber) ? column : asNumber;
}

/** Builds the `column` key only when a value was actually entered — required
 * because `exactOptionalPropertyTypes` treats `{ column: undefined }`
 * differently from omitting `column` entirely. */
function columnOption(column: string): { column: string | number } | Record<string, never> {
  const parsed = parseColumnField(column);
  return parsed === undefined ? {} : { column: parsed };
}

// Warnings that mean the file genuinely can't be processed as configured —
// as opposed to `single-column-detected`, which is only ever informational
// (a real single-column file is completely valid input).
const BLOCKING_WARNING_CODES = new Set<BatchPreviewWarning['code']>([
  'empty-file',
  'no-data-rows',
  'column-not-found',
  'column-out-of-range'
]);

export function BatchPage({ strings: s }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [column, setColumn] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [preview, setPreview] = useState<BatchPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [report, setReport] = useState<BatchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-preview whenever the selected file, column, or hasHeader changes, so
  // validation problems (wrong column, empty file, headerless-file
  // mis-detection, ...) surface before the user commits to processing.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    previewCsvFile(file, { ...columnOption(column), hasHeader })
      .then((result) => {
        if (!cancelled) {
          setPreview(result);
          setPreviewError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file, column, hasHeader]);

  const blockingWarnings =
    preview?.warnings.filter((w) => BLOCKING_WARNING_CODES.has(w.code)) ?? [];
  const infoWarnings = preview?.warnings.filter((w) => !BLOCKING_WARNING_CODES.has(w.code)) ?? [];
  const canProcess = !!file && !previewError && blockingWarnings.length === 0;

  const warningText = (code: BatchPreviewWarning['code']): string => {
    switch (code) {
      case 'empty-file':
        return s.batch.warningEmptyFile;
      case 'no-data-rows':
        return s.batch.warningNoDataRows;
      case 'column-not-found':
        return s.batch.warningColumnNotFound;
      case 'column-out-of-range':
        return s.batch.warningColumnOutOfRange;
      case 'single-column-detected':
        return s.batch.warningSingleColumn;
    }
  };

  const run = async () => {
    setError(null);
    setReport(null);

    if (!file) {
      setError(s.batch.noFileError);
      return;
    }

    setProcessing(true);
    setProgress(0);
    try {
      const result = await processCsvFile(file, {
        ...columnOption(column),
        hasHeader,
        onProgress: (processed, total) => setProgress(total > 0 ? processed / total : 0)
      });
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">{s.batch.title}</h1>
        <p className="text-gray-500">{s.batch.subtitle}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hard-shadow">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-500 hover:border-scholargreen hover:text-scholargreen transition-colors"
        >
          <UploadCloud className="w-8 h-8" />
          <span className="font-medium">{file ? file.name : s.batch.uploadLabel}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700">{s.batch.columnLabel}</label>
            <input
              type="text"
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              placeholder={s.batch.columnPlaceholder}
              className="brill-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:pt-6">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-scholargreen focus:ring-scholargreen"
            />
            {s.batch.hasHeaderLabel}
          </label>
        </div>

        {file && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">{s.batch.previewTitle}</h2>
              {preview && (
                <span className="text-xs text-gray-500">
                  {preview.totalDataRows} {s.batch.previewRowCount} · {s.batch.previewColumnLabel}:{' '}
                  {preview.headerRow?.[preview.columnIndex] ?? preview.columnIndex}
                </span>
              )}
            </div>

            {previewError && (
              <p className="flex items-center gap-2 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {previewError}
              </p>
            )}

            {[...blockingWarnings, ...infoWarnings].map((w) => (
              <p
                key={w.code}
                className={`flex items-center gap-2 text-sm ${
                  BLOCKING_WARNING_CODES.has(w.code) ? 'text-red-700' : 'text-amber-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {warningText(w.code)}
              </p>
            ))}

            {preview && preview.sampleRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" dir="ltr">
                  {preview.headerRow && (
                    <thead>
                      <tr className="text-gray-500">
                        {preview.headerRow.map((h, i) => (
                          <th key={i} className="px-2 py-1 text-start font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-200">
                    {preview.sampleRows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-2 py-1 ${j === preview.columnIndex ? 'font-semibold text-scholargreen' : 'text-gray-600'}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void run()}
          disabled={processing || !canProcess}
          className="bg-scholargreen text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-scholargreen-dark active:scale-95 transition-all disabled:opacity-50"
        >
          {processing
            ? `${s.batch.progressLabel} ${Math.round(progress * 100)}%`
            : s.batch.processBtn}
        </button>
      </section>

      {report && (
        <section className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatCard
              label={s.batch.summarySuccess}
              value={report.successCount}
              color="text-scholargreen"
            />
            <StatCard label={s.batch.summaryError} value={report.errorCount} color="text-red-600" />
            <StatCard
              label={s.batch.summarySkipped}
              value={report.skippedCount}
              color="text-gray-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                downloadFile(exportReportToCsv(report), 'arabname-batch-results.csv', 'text/csv')
              }
              className="flex items-center gap-2 text-sm font-medium text-scholargreen hover:underline"
            >
              <Download className="w-4 h-4" />
              {s.batch.downloadCsvBtn}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFile(
                  JSON.stringify(report, null, 2),
                  'arabname-batch-results.json',
                  'application/json'
                )
              }
              className="flex items-center gap-2 text-sm font-medium text-scholargreen hover:underline"
            >
              <Download className="w-4 h-4" />
              {s.batch.downloadJsonBtn}
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {report.rows.map((row) => (
                  <tr key={row.rowIndex}>
                    <td className="px-4 py-2 text-gray-400 w-10">{row.rowIndex}</td>
                    <td className="px-4 py-2">{row.input}</td>
                    <td className="px-4 py-2 arabic-text text-lg" dir="rtl">
                      {row.status === 'ok' ? row.output.arabicHarakat : ''}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {row.status === 'ok' && <span className="text-scholargreen">ok</span>}
                      {row.status === 'error' && <span className="text-red-600">{row.error}</span>}
                      {row.status === 'skipped' && (
                        <span className="text-gray-400">{row.reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}
