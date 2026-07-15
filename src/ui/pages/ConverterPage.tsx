import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  SlidersHorizontal,
  Keyboard,
  TriangleAlert
} from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import { transliterationService } from '@services/TransliterationService.js';
import { historyService } from '@services/HistoryService.js';
import {
  DEFAULT_BRACKET_FIX_OPTIONS,
  containsDin31635Chars,
  type BracketFixOptions
} from '@core/transliteration/index.js';
import type { ConversionOutput, HistoryEntry, TransliterationScheme } from '@shared/types.js';
import { VirtualKeyboard, type KeyboardLayout } from '@ui/components/VirtualKeyboard.js';
import { AdvancedOptions } from '@ui/components/AdvancedOptions.js';

interface Props {
  strings: UIStrings;
}

type Direction = 'latin-to-arabic' | 'arabic-to-latin';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-gray-400 hover:text-scholargreen transition-colors shrink-0"
      aria-label={label}
      title={label}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export function ConverterPage({ strings: s }: Props) {
  const [direction, setDirection] = useState<Direction>('latin-to-arabic');
  const [scheme, setScheme] = useState<TransliterationScheme>('brill');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ambiguousWarning, setAmbiguousWarning] = useState(false);
  const [result, setResult] = useState<ConversionOutput | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => historyService.getAll());
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('latin');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bracketOptions, setBracketOptions] = useState<BracketFixOptions>(
    DEFAULT_BRACKET_FIX_OPTIONS
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-select the keyboard matching the current direction/scheme, without
  // overriding a manual pick made via the keyboard's own tabs in between.
  useEffect(() => {
    setKeyboardLayout(
      direction === 'arabic-to-latin' ? 'arabic' : scheme === 'din31635' ? 'din' : 'latin'
    );
  }, [direction, scheme]);

  // Live heuristic: if "Latin (Brill)" is selected but the input contains
  // DIN 31635-only letters (š, ǧ, ġ, ḏ, ṯ, ẖ, ẗ), Brill's engine can't read
  // them as single characters and the result would be corrupted — warn
  // rather than silently producing garbage. Does not block conversion.
  const schemeMismatch =
    direction === 'latin-to-arabic' && scheme === 'brill' && containsDin31635Chars(input);

  const handleInputChange = (next: string) => {
    setInput(next);
    if (direction === 'arabic-to-latin') {
      const hasArabic = /[\u0600-\u06FF]/.test(next);
      const hasHarakat = /[\u064B-\u0652]/.test(next);
      setAmbiguousWarning(hasArabic && !hasHarakat && next.trim().length > 2);
    }
  };

  const convert = () => {
    setError(null);
    setResult(null);

    if (!input.trim()) {
      setError(s.converter.noInputError);
      return;
    }

    try {
      const output =
        direction === 'latin-to-arabic'
          ? transliterationService.convert({ text: input, scheme }, { bracketFix: bracketOptions })
          : transliterationService.convertReverse(input, scheme);
      setResult(output);
      // Every conversion — either direction — is added to history, along
      // with which scheme it used.
      historyService.push(output);
      setHistory(historyService.getAll());
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FULLY_DIACRITIZED') {
        setError(s.converter.notDiacritizedWarning);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const clear = () => {
    setInput('');
    setResult(null);
    setError(null);
    setAmbiguousWarning(false);
  };

  const swapDirection = () => {
    setDirection((d) => (d === 'latin-to-arabic' ? 'arabic-to-latin' : 'latin-to-arabic'));
    clear();
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setDirection(entry.direction);
    setScheme(entry.scheme);
    setInput(entry.direction === 'latin-to-arabic' ? entry.input : entry.arabicHarakat);
    setResult(entry);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">{s.converter.title}</h1>
        <p className="text-gray-500">{s.converter.subtitle}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden hard-shadow">
        {/* Direction toggle + advanced options trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-gray-200 bg-surface-container/40">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                direction === 'latin-to-arabic' ? 'bg-ink text-white' : 'text-gray-400'
              }`}
            >
              {s.converter.directionLatinLabel}
            </span>
            <button
              type="button"
              onClick={swapDirection}
              aria-label={s.converter.swapDirectionBtn}
              title={s.converter.swapDirectionBtn}
              className="p-2 rounded-full border border-gray-300 hover:bg-white hover:border-scholargreen transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <span
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                direction === 'arabic-to-latin' ? 'bg-ink text-white' : 'text-gray-400'
              }`}
            >
              {s.converter.directionArabicLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyboard((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                showKeyboard
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-300 text-gray-600 hover:border-scholargreen hover:text-scholargreen'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              {s.converter.keyboardToggleBtn}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                showAdvanced
                  ? 'bg-ink text-white border-ink'
                  : 'border-gray-300 text-gray-600 hover:border-scholargreen hover:text-scholargreen'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {s.converter.advancedOptionsBtn}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {showAdvanced && (
            <AdvancedOptions strings={s} options={bracketOptions} onChange={setBracketOptions} />
          )}

          {/* Scheme selector: which Latin scheme to type in (Latin -> Arabic)
              or treat as primary output (Arabic -> Latin). Both Brill and
              DIN 31635 Latin forms are always shown in the result either way. */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              {s.converter.schemeLabel}
            </label>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm font-semibold">
              <button
                type="button"
                onClick={() => setScheme('brill')}
                className={`px-3 py-1.5 transition-colors ${
                  scheme === 'brill'
                    ? 'bg-scholargreen text-white'
                    : 'bg-white text-gray-600 hover:bg-surface-container'
                }`}
              >
                {s.converter.schemeBrillOption}
              </button>
              <button
                type="button"
                onClick={() => setScheme('din31635')}
                className={`px-3 py-1.5 border-s border-gray-300 transition-colors ${
                  scheme === 'din31635'
                    ? 'bg-scholargreen text-white'
                    : 'bg-white text-gray-600 hover:bg-surface-container'
                }`}
              >
                {s.converter.schemeDinOption}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              {direction === 'latin-to-arabic'
                ? s.converter.inputLabel
                : s.converter.arabicInputLabel}
            </label>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) convert();
              }}
              rows={3}
              spellCheck={false}
              dir={direction === 'arabic-to-latin' ? 'rtl' : 'ltr'}
              className={`brill-input w-full rounded-lg border border-gray-300 px-4 py-3 text-lg transition-shadow ${
                direction === 'arabic-to-latin' ? 'arabic-text' : ''
              }`}
              placeholder={
                direction === 'latin-to-arabic'
                  ? scheme === 'din31635'
                    ? s.converter.dinInputPlaceholder
                    : s.converter.inputPlaceholder
                  : s.converter.arabicInputPlaceholder
              }
            />

            {showKeyboard && (
              <VirtualKeyboard
                targetRef={textareaRef}
                value={input}
                onChange={handleInputChange}
                layout={keyboardLayout}
                onLayoutChange={setKeyboardLayout}
                latinTabLabel={s.converter.keyboardLatinTab}
                dinTabLabel={s.converter.keyboardDinTab}
                arabicTabLabel={s.converter.keyboardArabicTab}
              />
            )}
          </div>

          {schemeMismatch && !error && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <TriangleAlert className="w-4 h-4 text-scholargold mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <p className="text-xs text-amber-900">{s.converter.schemeMismatchWarning}</p>
                <button
                  type="button"
                  onClick={() => setScheme('din31635')}
                  className="text-xs font-semibold text-scholargreen hover:underline"
                >
                  {s.converter.switchToDinBtn}
                </button>
              </div>
            </div>
          )}

          {ambiguousWarning && !error && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <TriangleAlert className="w-4 h-4 text-scholargold mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900">{s.converter.notDiacritizedWarning}</p>
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={convert}
              className="bg-scholargreen text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-scholargreen-dark active:scale-95 transition-all"
            >
              {s.converter.convertBtn}
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-sm font-medium text-gray-500 hover:text-ink"
            >
              {s.converter.clearBtn}
            </button>
            <span className="ms-auto text-xs text-gray-400 hidden sm:inline">
              {s.converter.limitNote}
            </span>
          </div>
        </div>
      </section>

      {result && (
        <section className="grid gap-4 sm:grid-cols-2 animate-in fade-in">
          {result.direction === 'latin-to-arabic' ? (
            <>
              <OutputCard
                label={s.converter.withHarakatLabel}
                value={result.arabicHarakat}
                arabic
                copyLabel={s.converter.copyBtn}
                primary
              />
              <OutputCard
                label={s.converter.withoutHarakatLabel}
                value={result.arabic}
                arabic
                copyLabel={s.converter.copyBtn}
              />
              <OutputCard
                label={s.converter.outputBrillLabel}
                value={result.brillLatin}
                copyLabel={s.converter.copyBtn}
                primary={result.scheme === 'brill'}
              />
              <OutputCard
                label={s.converter.outputDinLabel}
                value={result.dinLatin}
                copyLabel={s.converter.copyBtn}
                primary={result.scheme === 'din31635'}
              />
              <OutputCard
                label={s.converter.normalizedLabel}
                value={result.normalizedName}
                copyLabel={s.converter.copyBtn}
              />
              <OutputCard
                label={s.converter.nameOrderLabel}
                value={result.nameOrder}
                copyLabel={s.converter.copyBtn}
              />
            </>
          ) : (
            <>
              <OutputCard
                label={s.converter.outputBrillLabel}
                value={result.brillLatin}
                copyLabel={s.converter.copyBtn}
                primary={result.scheme === 'brill'}
              />
              <OutputCard
                label={s.converter.outputDinLabel}
                value={result.dinLatin}
                copyLabel={s.converter.copyBtn}
                primary={result.scheme === 'din31635'}
              />
            </>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{s.history.title}</h2>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                historyService.clear();
                setHistory([]);
              }}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {s.history.clearAll}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">{s.history.empty}</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <button
                  type="button"
                  onClick={() => loadHistoryEntry(entry)}
                  className="text-start min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-scholargreen bg-scholargreen/10 rounded px-1.5 py-0.5">
                      {entry.direction === 'latin-to-arabic'
                        ? s.converter.directionLatinLabel
                        : s.converter.directionArabicLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-surface-container rounded px-1.5 py-0.5">
                      {entry.scheme === 'brill'
                        ? s.converter.schemeBrillOption
                        : s.converter.schemeDinOption}
                    </span>
                  </div>
                  <p
                    className={`text-sm text-gray-500 truncate ${entry.direction === 'arabic-to-latin' ? 'arabic-text' : ''}`}
                    dir={entry.direction === 'arabic-to-latin' ? 'rtl' : undefined}
                  >
                    {entry.input}
                  </p>
                  {entry.direction === 'latin-to-arabic' ? (
                    <p className="arabic-text text-lg truncate">{entry.arabicHarakat}</p>
                  ) : (
                    <p className="text-lg font-serif truncate">
                      {entry.scheme === 'din31635' ? entry.dinLatin : entry.brillLatin}
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    historyService.remove(entry.id);
                    setHistory(historyService.getAll());
                  }}
                  className="text-xs font-medium text-gray-400 hover:text-red-600 shrink-0"
                >
                  {s.history.removeEntry}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OutputCard({
  label,
  value,
  arabic,
  copyLabel,
  primary
}: {
  label: string;
  value: string;
  arabic?: boolean;
  copyLabel: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-3 ${
        primary ? 'border-scholargreen/40 ring-1 ring-scholargreen/10' : 'border-gray-200'
      }`}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p
          className={arabic ? 'arabic-text text-2xl' : 'text-base font-serif'}
          dir={arabic ? 'rtl' : undefined}
        >
          {value}
        </p>
      </div>
      <CopyButton value={value} label={copyLabel} />
    </div>
  );
}
