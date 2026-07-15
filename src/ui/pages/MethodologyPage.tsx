import { useEffect, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import type { UIStrings } from '@ui/i18n/index.js';
import { transliterationService } from '@services/TransliterationService.js';

interface Props {
  strings: UIStrings;
}

interface CharRow {
  arabic: string;
  latin: string;
  din?: string;
  note: string;
  recommended?: boolean;
}

// Verified against docs/METHODOLOGY.md and the regression suite in
// tests/core/transliteration.test.ts — rows marked `recommended` are the
// forms confirmed to round-trip correctly through the engine today.
const CHARACTER_TABLE: CharRow[] = [
  { arabic: 'ا', latin: 'ā', din: 'ā', note: 'Long alif' },
  { arabic: 'ب', latin: 'b', din: 'b', note: '' },
  { arabic: 'ت', latin: 't', din: 't', note: '' },
  {
    arabic: 'ث',
    latin: 'th',
    din: 'ṯ',
    note: 'DIN 31635 uses ṯ — select the DIN 31635 scheme to type it directly'
  },
  {
    arabic: 'ج',
    latin: 'j',
    din: 'ǧ',
    note: '"dj" is not a reliable Brill alias for j — but DIN 31635\u2019s "ǧ" works via the DIN scheme selector',
    recommended: true
  },
  { arabic: 'ح', latin: 'ḥ', din: 'ḥ', note: 'Underdot (U+1E25) — shared with DIN 31635' },
  {
    arabic: 'خ',
    latin: 'kh / ḫ',
    din: 'ẖ',
    note: 'kh/ḫ both accepted and interchangeable; DIN 31635\u2019s ẖ is not',
    recommended: true
  },
  { arabic: 'د', latin: 'd', din: 'd', note: '' },
  {
    arabic: 'ذ',
    latin: 'dh',
    din: 'ḏ',
    note: 'DIN 31635 uses ḏ — select the DIN 31635 scheme to type it directly'
  },
  { arabic: 'ر', latin: 'r', din: 'r', note: '' },
  { arabic: 'ز', latin: 'z', din: 'z', note: '' },
  { arabic: 'س', latin: 's', din: 's', note: '' },
  {
    arabic: 'ش',
    latin: 'sh',
    din: 'š',
    note: 'DIN 31635 uses š — select the DIN 31635 scheme to type it directly',
    recommended: true
  },
  { arabic: 'ص', latin: 'ṣ', din: 'ṣ', note: 'Underdot (U+1E63) — shared with DIN 31635' },
  { arabic: 'ض', latin: 'ḍ', din: 'ḍ', note: 'Underdot (U+1E0D) — shared with DIN 31635' },
  { arabic: 'ط', latin: 'ṭ', din: 'ṭ', note: 'Underdot (U+1E6D) — shared with DIN 31635' },
  { arabic: 'ظ', latin: 'ẓ', din: 'ẓ', note: 'Underdot (U+1E93) — shared with DIN 31635' },
  {
    arabic: 'ع',
    latin: 'ʿ',
    din: 'ʿ',
    note: 'Turned comma, U+02BF — backtick (`) is normalised to this'
  },
  {
    arabic: 'غ',
    latin: 'gh',
    din: 'ġ',
    note: 'DIN 31635 uses ġ — select the DIN 31635 scheme to type it directly',
    recommended: true
  },
  { arabic: 'ف', latin: 'f', din: 'f', note: '' },
  { arabic: 'ق', latin: 'q', din: 'q', note: '' },
  { arabic: 'ك', latin: 'k', din: 'k', note: '' },
  { arabic: 'ل', latin: 'l', din: 'l', note: '' },
  { arabic: 'م', latin: 'm', din: 'm', note: '' },
  { arabic: 'ن', latin: 'n', din: 'n', note: '' },
  { arabic: 'ه', latin: 'h', din: 'h', note: '' },
  { arabic: 'و', latin: 'w / ū', din: 'w / ū', note: 'Consonant w; long vowel ū' },
  { arabic: 'ي', latin: 'y / ī', din: 'y / ī', note: 'Consonant y; long vowel ī' },
  {
    arabic: 'ء',
    latin: 'ʾ',
    din: 'ʾ',
    note: "Hamza, U+02BE — ASCII apostrophe (') is normalised to this"
  },
  {
    arabic: 'ة',
    latin: 'a',
    din: 'ẗ',
    note: 'DIN 31635 uses ẗ — select the DIN 31635 scheme to type it directly'
  },
  {
    arabic: 'الـ',
    latin: 'al-',
    din: 'al-',
    note: 'Definite article; sun-letter assimilation applied automatically'
  }
];

const SUN_LETTERS = 'ت ث د ذ ر ز س ش ص ض ط ظ ل ن'.split(' ');

interface Section {
  id: string;
  label: (s: UIStrings) => string;
}

function useScrollSpy(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0] ?? '');
  useEffect(() => {
    const onScroll = () => {
      let current = sectionIds[0] ?? '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - 140 <= 0) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIds]);
  return active;
}

export function MethodologyPage({ strings: s }: Props) {
  const sections: Section[] = [
    { id: 'brill-standard', label: (str) => str.methodology.navBrillStandards },
    { id: 'din-31635', label: (str) => str.methodology.navDin31635 },
    { id: 'character-table', label: (str) => str.methodology.navCharacterTable },
    { id: 'engine-layers', label: (str) => str.methodology.navEngineLayers },
    { id: 'orthography', label: (str) => str.methodology.navOrthography },
    { id: 'limitations', label: (str) => str.methodology.navLimitations },
    { id: 'references', label: (str) => str.methodology.navReferences }
  ];
  const sectionIds = sections.map((sec) => sec.id);
  const active = useScrollSpy(sectionIds);
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
      {/* Sticky table of contents */}
      <aside className="hidden lg:block h-fit sticky top-24 print:hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {s.methodology.title}
        </p>
        <nav className="space-y-1 border-s-2 border-gray-200">
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block ps-4 -ms-0.5 py-1.5 text-sm border-s-2 transition-colors ${
                active === sec.id
                  ? 'border-scholargreen text-scholargreen font-semibold'
                  : 'border-transparent text-gray-500 hover:text-ink'
              }`}
            >
              {sec.label(s)}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-scholargreen"
        >
          <Printer className="w-3.5 h-3.5" />
          {s.methodology.printBtn}
        </button>
      </aside>

      <div ref={printRef} className="space-y-16 max-w-3xl">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">{s.methodology.title}</h1>
          <p className="text-gray-500">{s.methodology.subtitle}</p>
        </div>

        <Section id="brill-standard" title={s.methodology.navBrillStandards}>
          <p>
            The converter implements the <strong>Brill transliteration system</strong> as used in{' '}
            <em>Encyclopaedia of Islam</em> (3rd edition, &ldquo;EI3&rdquo;) — the standard most
            commonly used in English-language Islamic studies scholarship, and the one this
            project&rsquo;s source engine (TabaqatPerfect) was built against.
          </p>
          <p>
            The two editions&rsquo; Arabic tables are substantively the same (same underdots, same
            macrons, same <code>ʿ</code>/<code>ʾ</code> for ʿayn/hamza). The most visible difference
            affecting personal names is the treatment of ج: EI2 house style traditionally rendered
            it as <code>dj</code>, while EI3 and most contemporary usage favour the simpler{' '}
            <code>j</code>.{' '}
            <strong>
              Input <code>j</code>
            </strong>{' '}
            — it is the form this engine&rsquo;s rules actually implement; see the character table
            below for why a standalone <code>dj</code> is not a safe substitute.
          </p>
          <p className="text-sm text-gray-500">
            Cross-referenced against the <em>IJMES Translation and Transliteration Guide</em>{' '}
            (largely Brill-compatible) and the ALA-LC <em>Arabic Romanization Table</em> (used by
            North American library catalogues, and the system researchers most often need to
            pre-normalise <em>from</em> before pasting into this tool — e.g. converting a
            catalogue&rsquo;s word-final <code>ah</code> to the Brill bare <code>a</code>).
          </p>
          <div className="bg-scholargold/10 border border-scholargold/30 rounded-lg px-4 py-3 text-sm">
            <strong>DIN 31635 is also supported</strong> — see the next section — as a second,
            fully-tested input/output scheme. It is a distinct German Oriental Society standard, not
            a Brill variant; the converter treats them as two spelling conventions for the same
            underlying Arabic.
          </div>
        </Section>

        <Section id="din-31635" title={s.methodology.navDin31635}>
          <p>
            <strong>DIN 31635</strong> (&ldquo;Information und Dokumentation — Umschrift des
            arabischen Alphabets,&rdquo; Deutsches Institut für Normung e.V., 2011) is the
            transliteration standard used in German-language Arabic and Islamic studies — e.g.
            Brockelmann&rsquo;s <em>Geschichte der arabischen Litteratur</em> (GAL). It shares
            Brill&rsquo;s macron/underdot letters (ā ḥ ṣ ḍ ṭ ẓ ʿ ʾ) but uses single Unicode letters
            — <strong>ǧ š ġ ḏ ṯ ẖ ẗ</strong> — where Brill uses digraphs.
          </p>
          <p>
            Select <strong>&ldquo;DIN 31635&rdquo;</strong> as the input scheme in the Converter to
            type these seven letters directly (a dedicated keyboard tab is provided). The converter
            treats DIN and Brill as two spellings of the same underlying Arabic — the result is
            byte-for-byte identical either way — and always shows <strong>both</strong> the Brill
            and DIN 31635 Latin forms in the output, regardless of which scheme you typed in. The
            scheme selector works for <strong>both</strong> conversion directions: for Arabic →
            Latin, it marks which of the two Latin forms is treated as primary.
          </p>
          <p className="text-sm text-gray-500">
            If &ldquo;Latin (Brill)&rdquo; is selected but the input contains a DIN 31635-specific
            letter (e.g. a lone <code>š</code> in <code>Abū Ma'šar</code>), the converter shows a
            warning — Brill&rsquo;s engine can&rsquo;t read that letter as a single character, so
            the result may be corrupted — with a one-click option to switch to DIN 31635.
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-surface-container/60 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-start px-4 py-2 font-semibold">DIN 31635</th>
                  <th className="text-start px-4 py-2 font-semibold">Brill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['ǧ', 'j (single or doubled: j / jj)'],
                  ['š', 'sh (single or doubled: sh / shsh)'],
                  ['ġ', 'gh (single or doubled: gh / ghgh)'],
                  ['ḏ', 'dh'],
                  ['ṯ', 'th'],
                  ['ẖ', 'kh (ḫ also works natively)'],
                  ['ẗ', 'a (bare, word-final tāʾ marbūṭa)']
                ].map(([din, brill]) => (
                  <tr key={din}>
                    <td className="px-4 py-2 font-serif align-top">{din}</td>
                    <td className="px-4 py-2 font-serif align-top">{brill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">
            Implemented in <code>src/core/transliteration/din31635.ts</code>, verified by 45
            regression tests (<code>tests/core/din31635.test.ts</code>) plus service-level
            integration tests — see ADR-007. The Brill engine itself (
            <code>src/core/transliteration/brill/</code>) is never modified; DIN input is converted
            to Brill before conversion, and Brill output is converted to DIN for display.
          </p>
        </Section>

        <Section id="character-table" title={s.methodology.navCharacterTable}>
          <p>
            Full Brill character table as implemented by the engine. Rows marked{' '}
            <span className="inline-block bg-secondary-container text-xs font-bold px-1.5 py-0.5 rounded bg-scholargreen/10 text-scholargreen">
              {s.methodology.recommendedBadge}
            </span>{' '}
            are the forms verified — by the automated test suite, not just documentation — to behave
            as described.
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-surface-container/60 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-start px-4 py-2 font-semibold">
                    {s.methodology.tableArabic}
                  </th>
                  <th className="text-start px-4 py-2 font-semibold">{s.methodology.tableLatin}</th>
                  <th className="text-start px-4 py-2 font-semibold text-gray-400">
                    {s.methodology.tableDin}
                  </th>
                  <th className="text-start px-4 py-2 font-semibold">{s.methodology.tableNotes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CHARACTER_TABLE.map((row) => (
                  <tr key={row.arabic + row.latin}>
                    <td className="px-4 py-2 arabic-text text-xl align-top">{row.arabic}</td>
                    <td className="px-4 py-2 font-serif align-top whitespace-nowrap">
                      {row.latin}
                      {row.recommended && (
                        <span className="ms-2 inline-block bg-scholargreen/10 text-scholargreen text-[10px] font-bold px-1.5 py-0.5 rounded align-middle">
                          {s.methodology.recommendedBadge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-serif align-top whitespace-nowrap text-gray-400">
                      {row.din ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 align-top">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <strong>Shadda (gemination):</strong> doubled consonants in Latin map to shadda (ّ) —{' '}
            <code>mm</code> → <span className="arabic-text">مّ</span>, <code>ll</code> →{' '}
            <span className="arabic-text">لّ</span>, <code>Muḥammad</code> →{' '}
            <span className="arabic-text">مُحَمَّد</span>.
          </p>
        </Section>

        <Section id="engine-layers" title={s.methodology.navEngineLayers}>
          <p>The engine resolves each input through six layers, in priority order:</p>
          <ol className="list-decimal ps-5 space-y-2">
            <li>
              <strong>Sourced corrections</strong> — exact-match fixes for specific known-degraded
              strings, each citing a verified source. Checked first.
            </li>
            <li>
              <strong>Curated dictionary</strong> — hand-vetted compounds (e.g.{' '}
              <code>ʿAbd al-Raḥmān</code>, <code>Abū Bakr</code>) matched greedily, longest sequence
              first.
            </li>
            <li>
              <strong>Legacy character-level engine</strong> — the full Brill regex table, covering
              any word not already matched above.
            </li>
            <li>
              <strong>Bracket sanitiser</strong> — repairs stray, unmatched brackets; well-formed
              balanced brackets (genuine editorial notation, e.g. <code>(Zajjāj?)</code>) are
              preserved verbatim by default.
            </li>
            <li>
              <strong>Yā-sukūn house style</strong> — a medial long-ī takes a sukūn; a word-final
              one does not.
            </li>
            <li>
              <strong>Reverse direction (Arabic → Latin)</strong> — a character-level inverse of the
              productive rules, scoped strictly to fully-diacritised input. Undiacritised Arabic is
              rejected rather than guessed at, since short vowels cannot be recovered without them.
            </li>
          </ol>
        </Section>

        <Section id="orthography" title={s.methodology.navOrthography}>
          <p>
            <strong>Sun-letter assimilation:</strong> <code>al-</code> assimilates into a shadda on
            the following consonant for all fourteen sun letters ({SUN_LETTERS.join(', ')}) — e.g.{' '}
            <code>al-Raḥmān</code> → <span className="arabic-text">الرَّحْمَان</span>. Before a moon
            letter (e.g. <code>ق</code>), the lām is pronounced and appears in the output.
          </p>
          <p>
            <strong>The nisba:</strong> suffixes like <em>-iyy</em> (masculine) and <em>-iyya</em>{' '}
            (feminine) are rendered with double semi-vowels, following Classical onomastic
            convention.
          </p>
          <p>
            <strong>Tāʾ marbūṭa:</strong> rendered as <em>-a</em> in pausa and <em>-at</em> in{' '}
            <em>iḍāfa</em> constructions.
          </p>
          <p>
            <strong>ابن (ibn, &ldquo;son of&rdquo;):</strong> keeps its alif only as the first word
            of a name (<code>Ibn Khaldūn</code> → <span className="arabic-text">ابْن خَلْدُون</span>
            ). Between two names — the patronymic position, and the more common case in personal
            names — the alif is elided (<code>Abū Marwān ibn Zuhr</code> →{' '}
            <span className="arabic-text">أَبُو مَرْوَان بْن زُهْر</span>). The converter detects
            this automatically based on position; <code>Bint</code> (&ldquo;daughter of&rdquo;) is
            unaffected, since it never takes an alif regardless of position. In reverse (Arabic →
            Latin), both spellings — <span className="arabic-text">بْن</span> and{' '}
            <span className="arabic-text">ابْن</span> — convert back to <code>ibn</code>, not the
            bare consonant cluster <code>bn</code>: Brill convention keeps the epenthetic vowel in
            the Latin spelling in both positions, even though only the initial position keeps the
            alif in Arabic script.
          </p>
          <p>
            <strong>Elided-article spelling:</strong> some sources write the definite article, after
            a preceding vowel, in its elided-pronunciation form — <code>Abū l-Qāsim</code> or{' '}
            <code>Abū 'l-Qāsim</code> instead of <code>Abū al-Qāsim</code>. Arabic orthography
            always writes the article's alif regardless of connected-speech elision, so the
            converter normalises either spelling to the full <code>al-</code> form automatically
            before conversion.
          </p>
        </Section>

        <Section id="limitations" title={s.methodology.navLimitations}>
          <ol className="list-decimal ps-5 space-y-3">
            <li>
              <strong>Arabic → Latin requires full diacritics.</strong> Undiacritised Arabic lacks
              the information needed for unambiguous Brill output, so the reverse converter only
              accepts fully-voweled Arabic and warns rather than guessing.
            </li>
            <li>
              <strong>Input without diacritics degrades gracefully but imprecisely.</strong> A
              macron-less &ldquo;Abu Bakr&rdquo; still produces a plausible, but not authoritative,
              Arabic form via the legacy engine. The sourced-corrections layer exists specifically
              to rescue high-frequency degraded strings.
            </li>
            <li>
              <strong>Non-Brill, non-DIN romanisations need pre-normalisation.</strong> Names copied
              from IJMES- or ALA-LC-formatted sources need adjusting before conversion — see the
              comparison table in the Brill standard section above. DIN 31635 does{' '}
              <strong>not</strong> need this — select it directly as an input scheme.
            </li>
            <li>
              <strong>
                DIN 31635&rsquo;s tāʾ-marbūṭa detection (in the DIN output) is convention-specific.
              </strong>{' '}
              When showing the DIN 31635 form of a result, any word-final bare &ldquo;a&rdquo; (this
              project&rsquo;s Brill convention for tāʾ marbūṭa) is rendered as <code>ẗ</code>. This
              is correct for text this engine produced or accepted, but is not a general-purpose
              analyser of arbitrary Latin text.
            </li>
            <li>
              <strong>DIN 31635&rsquo;s capital ẖ has no precomposed Unicode form.</strong> German
              typesetting represents it as H + a combining macron below (U+0331); the DIN keyboard
              and converter both handle this two-character sequence directly.
            </li>
          </ol>
        </Section>

        <Section id="references" title={s.methodology.navReferences}>
          <p className="text-sm text-gray-500">
            Corrections in the sourced-corrections layer must cite one of these (or an equivalent
            citable scholarly source):
          </p>
          <ol className="list-decimal ps-5 space-y-2 text-sm">
            <li>
              Brill. <em>Encyclopaedia of Islam, THREE</em>. Kate Fleet, Gudrun Krämer, Denis
              Matringe, John Nawas, and Everett Rowson, eds. Leiden: Brill, 2007–present.
            </li>
            <li>
              Bearman, P., Th. Bianquis, C.E. Bosworth, E. van Donzel, and W.P. Heinrichs, eds.{' '}
              <em>The Encyclopaedia of Islam, Second Edition</em>. Leiden: Brill, 1960–2005.
            </li>
            <li>
              <em>International Journal of Middle East Studies</em>. &ldquo;IJMES Translation and
              Transliteration Guide.&rdquo; Cambridge University Press.
            </li>
            <li>
              Library of Congress, Policy and Standards Division.{' '}
              <em>ALA-LC Romanization Tables: Arabic</em>. American Library Association and Library
              of Congress.
            </li>
            <li>
              Deutsches Institut für Normung e.V.{' '}
              <em>DIN 31635:2011-07 — Umschrift des arabischen Alphabets</em>. Berlin: DIN, 2011.
              Source for the second supported input/output scheme.
            </li>
            <li>
              TabaqatPerfect (unpublished internal prosopography application) — source of the ported
              character-level engine rules.
            </li>
          </ol>
          <p className="text-xs text-gray-400">
            Full sourcing detail, per-rule rationale, and the engine-layer reference lives in{' '}
            <code>docs/METHODOLOGY.md</code>.
          </p>
        </Section>

        <p className="text-xs text-gray-400 border-t border-gray-200 pt-4">
          {s.common.ruleVersion}: {transliterationService.getRuleVersion()}
        </p>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="font-serif text-2xl font-bold border-b border-gray-200 pb-2">{title}</h2>
      <div className="space-y-4 text-sm md:text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}
