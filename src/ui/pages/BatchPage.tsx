import { useRef, useState } from 'react';
import { UploadCloud, Download } from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import { processCsvFile, exportReportToCsv } from '@services/BatchService.js';
import type { BatchReport } from '@shared/types.js';

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

export function BatchPage({ strings: s }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [column, setColumn] = useState('');
  const [report, setReport] = useState<BatchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
        column: column.trim() === '' ? 0 : Number.isNaN(Number(column)) ? column : Number(column),
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

        <div>
          <label className="text-sm font-semibold text-gray-700">{s.batch.columnLabel}</label>
          <input
            type="text"
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            placeholder={s.batch.columnPlaceholder}
            className="brill-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

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
          disabled={processing}
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
