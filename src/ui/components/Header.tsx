import { Globe } from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import type { View } from '../../App.js';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  strings: UIStrings;
  onToggleLocale: () => void;
}

const NAV_ITEMS: Array<{ view: View; label: (s: UIStrings) => string }> = [
  { view: 'converter', label: (s) => s.nav.converter },
  { view: 'batch', label: (s) => s.nav.batch },
  { view: 'dictionary', label: (s) => s.nav.dictionary },
  { view: 'methodology', label: (s) => s.nav.methodology }
];

export function Header({ view, setView, strings, onToggleLocale }: HeaderProps) {
  return (
    <header className="bg-parchment border-b border-gray-200 w-full sticky top-0 z-50 shadow-sm">
      <nav className="flex justify-between items-center w-full px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        <button onClick={() => setView('converter')} className="flex items-center gap-2 group">
          <span className="font-serif text-xl font-bold tracking-tight transition-colors group-hover:text-scholargreen">
            {strings.app.name}
          </span>
          <span className="hidden sm:inline text-xs text-gray-500">{strings.app.tagline}</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(({ view: itemView, label }) => (
            <button
              key={itemView}
              onClick={() => setView(itemView)}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                view === itemView
                  ? 'text-ink border-scholargreen font-semibold'
                  : 'text-gray-500 border-transparent hover:text-scholargreen'
              }`}
            >
              {label(strings)}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleLocale}
          className="bg-ink text-white hover:bg-scholargreen px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{strings.nav.toggleLang}</span>
        </button>
      </nav>

      <div className="flex md:hidden bg-surface-container border-t border-gray-100 divide-x divide-gray-200 text-center text-xs font-semibold">
        {NAV_ITEMS.map(({ view: itemView, label }) => (
          <button
            key={itemView}
            onClick={() => setView(itemView)}
            className={`flex-1 py-3 ${
              view === itemView ? 'text-scholargreen font-bold bg-white' : 'text-gray-600'
            }`}
          >
            {label(strings)}
          </button>
        ))}
      </div>
    </header>
  );
}
