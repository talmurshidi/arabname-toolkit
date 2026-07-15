import type { UIStrings } from '@ui/i18n/index.js';
import type { View } from '../../App.js';

interface FooterProps {
  strings: UIStrings;
  setView: (view: View) => void;
}

export function Footer({ strings, setView }: FooterProps) {
  return (
    <footer className="bg-parchment-dim border-t border-gray-200 w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto gap-4 text-sm">
        <div className="flex flex-col gap-1 text-center md:text-start">
          <span className="font-semibold text-gray-800">{strings.app.name}</span>
          <p className="text-gray-500 max-w-md leading-relaxed text-xs">{strings.app.footerDesc}</p>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-gray-500">
          <a
            href="https://github.com/talmurshidi/arabname-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-scholargreen hover:underline"
          >
            {strings.app.sourceCode}
          </a>
          <button
            onClick={() => setView('methodology')}
            className="hover:text-scholargreen hover:underline"
          >
            {strings.app.footerMethodology}
          </button>
          <span title={strings.app.privacyNotice} className="cursor-help">
            {strings.app.footerPrivacy}
          </span>
        </div>
      </div>
    </footer>
  );
}
