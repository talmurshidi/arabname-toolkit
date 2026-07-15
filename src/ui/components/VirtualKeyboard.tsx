import type { RefObject } from 'react';

export type KeyboardLayout = 'latin' | 'din' | 'arabic';

interface VirtualKeyboardProps {
  targetRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
  layout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
  latinTabLabel: string;
  dinTabLabel: string;
  arabicTabLabel: string;
}

// Only characters verified to round-trip through the transliteration engine
// are offered here (see docs/METHODOLOGY.md "Known limitations" — the
// single-character š/ġ caron alternates are DIN 31635, not Brill, and are
// offered on their own tab via the dedicated din31635.ts conversion layer).
const LATIN_KEYS = ['ā', 'ī', 'ū', 'ṭ', 'ṣ', 'ḥ', 'ḍ', 'ẓ', 'ḫ', 'ʿ', 'ʾ'];
// DIN 31635: the shared macron/underdot letters plus the seven letters that
// differ from Brill (ǧ š ġ ḏ ṯ ẖ ẗ) — see docs/METHODOLOGY.md.
const DIN_KEYS = [
  'ā',
  'ī',
  'ū',
  'ṭ',
  'ṣ',
  'ḥ',
  'ḍ',
  'ẓ',
  'ʿ',
  'ʾ',
  'ǧ',
  'š',
  'ġ',
  'ḏ',
  'ṯ',
  'ẖ',
  'ẗ'
];
const ARABIC_KEYS = ['َ', 'ُ', 'ِ', 'ْ', 'ّ', 'ً', 'ٌ', 'ٍ', 'ة', 'ء'];

const LAYOUT_KEYS: Record<KeyboardLayout, string[]> = {
  latin: LATIN_KEYS,
  din: DIN_KEYS,
  arabic: ARABIC_KEYS
};

export function VirtualKeyboard({
  targetRef,
  value,
  onChange,
  layout,
  onLayoutChange,
  latinTabLabel,
  dinTabLabel,
  arabicTabLabel
}: VirtualKeyboardProps) {
  const keys = LAYOUT_KEYS[layout];

  const insert = (char: string) => {
    const el = targetRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onChange(next);
    // Restore focus and caret position after the inserted character.
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const tabs: Array<{ id: KeyboardLayout; label: string }> = [
    { id: 'latin', label: latinTabLabel },
    { id: 'din', label: dinTabLabel },
    { id: 'arabic', label: arabicTabLabel }
  ];

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onLayoutChange(tab.id)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              layout === tab.id ? 'bg-ink text-white' : 'text-gray-500 hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => insert(char)}
            className={`virtual-key w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md text-base hover:bg-surface-container transition-colors ${
              layout === 'arabic' ? 'arabic-text' : ''
            }`}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
