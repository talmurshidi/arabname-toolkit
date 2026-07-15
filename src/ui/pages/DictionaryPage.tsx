import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import { dictionaryService } from '@services/DictionaryService.js';
import type { UserDictionaryEntry } from '@shared/types.js';

interface Props {
  strings: UIStrings;
}

export function DictionaryPage({ strings: s }: Props) {
  const [entries, setEntries] = useState<UserDictionaryEntry[]>(() => dictionaryService.getAll());
  const [query, setQuery] = useState('');
  const [latin, setLatin] = useState('');
  const [arabicHarakat, setArabicHarakat] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = entries.filter((e) => e.latin.toLowerCase().includes(query.toLowerCase()));

  const addEntry = () => {
    setError(null);
    try {
      dictionaryService.add({ latin, arabicHarakat });
      setEntries(dictionaryService.getAll());
      setLatin('');
      setArabicHarakat('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const removeEntry = (id: string) => {
    if (!window.confirm(s.dictionary.confirmDelete)) return;
    dictionaryService.remove(id);
    setEntries(dictionaryService.getAll());
  };

  const exportJson = () => {
    const blob = new Blob([dictionaryService.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arabname-user-dictionary.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    file.text().then((text) => {
      try {
        dictionaryService.importJson(text);
        setEntries(dictionaryService.getAll());
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">{s.dictionary.title}</h1>
        <p className="text-gray-500">{s.dictionary.subtitle}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hard-shadow">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">{s.dictionary.latinLabel}</label>
            <input
              value={latin}
              onChange={(e) => setLatin(e.target.value)}
              className="brill-input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              {s.dictionary.arabicHarakatLabel}
            </label>
            <input
              value={arabicHarakat}
              onChange={(e) => setArabicHarakat(e.target.value)}
              dir="rtl"
              className="brill-input arabic-text mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-lg"
            />
          </div>
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
          onClick={addEntry}
          className="flex items-center gap-2 bg-scholargreen text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-scholargreen-dark active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          {s.dictionary.addBtn}
        </button>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={s.dictionary.searchPlaceholder}
          className="brill-input flex-1 min-w-[12rem] rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={exportJson}
          className="text-sm font-medium text-scholargreen hover:underline"
        >
          {s.dictionary.exportBtn}
        </button>
        <label className="text-sm font-medium text-scholargreen hover:underline cursor-pointer">
          {s.dictionary.importBtn}
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
            }}
          />
        </label>
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">{s.dictionary.emptyState}</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
          {filtered.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm text-gray-500">{entry.latin}</p>
                <p className="arabic-text text-lg">{entry.arabicHarakat}</p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-gray-400 hover:text-red-600"
                aria-label={s.dictionary.deleteBtn}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
