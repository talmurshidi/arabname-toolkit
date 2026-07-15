import { useState } from 'react';
import { useLocale } from '@ui/hooks/useLocale.js';
import { Header } from '@ui/components/Header.js';
import { Footer } from '@ui/components/Footer.js';
import { ConverterPage } from '@ui/pages/ConverterPage.js';
import { BatchPage } from '@ui/pages/BatchPage.js';
import { DictionaryPage } from '@ui/pages/DictionaryPage.js';
import { MethodologyPage } from '@ui/pages/MethodologyPage.js';

export type View = 'converter' | 'batch' | 'dictionary' | 'methodology';

export default function App() {
  const [view, setView] = useState<View>('converter');
  const { locale, strings, toggle } = useLocale();

  return (
    <div
      className="min-h-screen flex flex-col bg-parchment text-ink font-sans selection:bg-emerald-100 selection:text-emerald-900"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      lang={locale}
    >
      <Header view={view} setView={setView} strings={strings} onToggleLocale={toggle} />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {view === 'converter' && <ConverterPage strings={strings} />}
        {view === 'batch' && <BatchPage strings={strings} />}
        {view === 'dictionary' && <DictionaryPage strings={strings} />}
        {view === 'methodology' && <MethodologyPage strings={strings} />}
      </main>

      <Footer strings={strings} setView={setView} />
    </div>
  );
}
