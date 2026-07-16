/**
 * Reverse direction: fully-diacritised Arabic script -> Brill Latin.
 *
 * This is deliberately scoped to *vocalised* input (full harakat). Arabic
 * without diacritics is documented as unsupported (see
 * docs/METHODOLOGY.md, "Known limitations") because short vowels cannot be
 * recovered without a phonological parser. Callers should detect missing
 * harakat with `looksFullyDiacritized()` and warn the user rather than
 * silently emitting a lossy guess.
 *
 * The mapping is a best-effort character-level inverse of the rules in
 * the Brill engine's (`src/core/transliteration/brill/`)
 * `transliterationToArabicHarakat()` — ported from `legacyEngine.mjs`,
 * now retired; see ADR-010. It round-trips the
 * regular/productive cases (consonant + short vowel, long vowels via
 * mater lectionis, shadda gemination, tāʾ marbūṭa, the definite article)
 * faithfully, but does not attempt to invert the handful of irregular
 * whole-word substitutions in the forward engine (e.g. "ʿAbdallāh",
 * "Ibn", "Abū") — those will come back as their literal phonetic spelling
 * rather than the historical orthographic convention.
 */

const FATHA = 'َ';
const DAMMA = 'ُ';
const KASRA = 'ِ';
const SUKUN = 'ْ';
const SHADDA = 'ّ';
const TANWIN_FATH = 'ً';
const TANWIN_DAMM = 'ٌ';
const TANWIN_KASR = 'ٍ';
const DAGGER_ALIF = 'ٰ';
const MADDA_ALIF = 'آ';

const HARAKAT = new Set([
  FATHA,
  DAMMA,
  KASRA,
  SUKUN,
  SHADDA,
  TANWIN_FATH,
  TANWIN_DAMM,
  TANWIN_KASR,
  DAGGER_ALIF
]);
// Marks that indicate a following و/ي is carrying its own vowel (i.e. is
// consonantal), as opposed to acting as a mater-lectionis long-vowel letter.
// A sukūn does NOT count here — it's the house-style marker on a medial
// long-ī (see arabicHouseStyle.ts) and must not block the long-vowel read.
const VOWEL_CARRYING_MARKS = new Set([
  FATHA,
  DAMMA,
  KASRA,
  SHADDA,
  TANWIN_FATH,
  TANWIN_DAMM,
  TANWIN_KASR
]);

const CONSONANTS: Record<string, string> = {
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'ḥ',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 'ṣ',
  ض: 'ḍ',
  ط: 'ṭ',
  ظ: 'ẓ',
  ع: 'ʿ',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y'
};

const HAMZA_SEATS = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ']);

/**
 * True when the (whitespace-trimmed) Arabic text is diacritised precisely
 * to the standard this project's own forward engine (`brill/`, ported
 * from the retired `legacyEngine.mjs` — see ADR-010)
 * actually produces: every consonant carries an explicit harakat mark,
 * EXCEPT a word-final consonant, which the forward engine conventionally
 * leaves bare (pausal form — e.g. "Bakr" -> بَكْر with no mark after the
 * final ر, "Khalaf" -> خَلَف with no mark after the final ف). Requiring a
 * mark there too would reject the forward engine's own real output, making
 * the reverse direction nearly unusable for names with more than one word
 * (see docs/METHODOLOGY.md and CHANGELOG for the regression this fixed).
 * A bare consonant that is NOT word-final (i.e. directly followed by
 * another letter, with no harakat in between) is still rejected — that is
 * a genuinely missing internal vowel, not this engine's pausal convention.
 * Used by the UI to warn before attempting a reverse conversion.
 */
export function looksFullyDiacritized(arabicText: string): boolean {
  const chars = Array.from(arabicText.trim());
  // ٱ (U+0671, alif wasla) is standard orthography for the hamzat al-waṣl —
  // e.g. the Qur'anic/Classical spelling of the definite article at the
  // start of "ٱللَّٰهُ" (Allāh) or "ٱلرَّحْمَٰنُ" (al-Raḥmān). It plays exactly the
  // same structural role as plain alif (ا) here: it never carries its own
  // harakat, and it signals the following lām is the (silent) article lām.
  const exempt = new Set(['ا', 'ٱ', 'ى', 'ة', ' ', ...HAMZA_SEATS]);
  let sawLetter = false;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i] as string;
    if (!(ch in CONSONANTS) && !HAMZA_SEATS.has(ch) && ch !== 'ا' && ch !== 'ٱ' && ch !== 'ى')
      continue;
    sawLetter = true;
    if (exempt.has(ch)) continue;
    // و/ي acting as mater lectionis (long ū/ī) carry no mark of their own —
    // the vowel mark already sits on the *preceding* consonant. Only a
    // *consonantal* و/ي (one about to carry its own vowel) needs one; that
    // is exactly what a following vowel-carrying mark indicates (the same
    // criterion readVowel() uses to make this same distinction).
    if ((ch === 'و' || ch === 'ي') && !VOWEL_CARRYING_MARKS.has(chars[i + 1] ?? '')) continue;
    const next = chars[i + 1];
    if (next !== undefined && HARAKAT.has(next)) continue;
    // The definite article's lām carries no mark of its own in this
    // project's forward output, for BOTH moon and sun letters — verified
    // against generateArabicHarakat() directly: "al-Qahira" -> القَهِرَة
    // (no mark on ل) and "al-Rahman" -> الرَّحْمَان (no mark on ل; the shadda
    // is sun-letter assimilation on the *following* consonant). Detect it
    // structurally: this is the lām right after a word-initial alif (the
    // alif is itself at position 0 or right after a space — not just
    // absolute index 1, so this also works for the 2nd/3rd/... word of a
    // multi-word name, not only the first).
    const prevIsWordInitialAlif =
      i > 0 && (chars[i - 1] === 'ا' || chars[i - 1] === 'ٱ') && (i === 1 || chars[i - 2] === ' ');
    const isArticleLam = ch === 'ل' && prevIsWordInitialAlif;
    if (isArticleLam) continue;
    // No harakat follows — acceptable only at a word boundary (pausal form).
    const isWordFinal = next === undefined || next === ' ';
    if (!isWordFinal) return false;
  }
  return sawLetter;
}

interface VowelRead {
  vowel: string;
  consumed: number;
  doubled: boolean;
}

/**
 * Reads the vowel cluster starting at `i`: an optional shadda (gemination),
 * the short-vowel mark, and finally an optional mater-lectionis long-vowel
 * letter (ا/و/ي) or, for a trailing fatha, a tāʾ marbūṭa (ة) that
 * represents the same "a" rather than adding a second one.
 *
 * The shadda may appear either *before* or *after* the vowel mark — e.g.
 * "مَّ" (mīm + fatha + shadda) for ordinary gemination, but "زَّ" written as
 * mīm + shadda + fatha for sun-letter assimilation in some code paths of
 * the forward engine. Both orders are handled so the reverse direction
 * doesn't depend on which internal path produced the diacritics.
 */
function readVowel(chars: string[], i: number): VowelRead {
  let idx = i;
  let base = '';
  let doubled = false;

  if (chars[idx] === SHADDA) {
    doubled = true;
    idx++;
  }

  const mark = chars[idx];
  if (mark === FATHA) {
    base = 'a';
    idx++;
  } else if (mark === DAMMA) {
    base = 'u';
    idx++;
  } else if (mark === KASRA) {
    base = 'i';
    idx++;
  } else if (mark === TANWIN_FATH) {
    return { vowel: 'an', consumed: idx - i + 1, doubled };
  } else if (mark === TANWIN_DAMM) {
    return { vowel: 'un', consumed: idx - i + 1, doubled };
  } else if (mark === TANWIN_KASR) {
    return { vowel: 'in', consumed: idx - i + 1, doubled };
  } else if (mark === SUKUN) {
    return { vowel: '', consumed: idx - i + 1, doubled };
  } else if (mark === 'ة') {
    // Bare tāʾ marbūṭa with no preceding fatha mark (malformed/edge input).
    return { vowel: 'a', consumed: idx - i + 1, doubled };
  }

  if (!doubled && chars[idx] === SHADDA) {
    doubled = true;
    idx++;
  }

  if (base === 'a' && (chars[idx] === 'ا' || chars[idx] === DAGGER_ALIF)) {
    // Dagger alif (ٰ, U+0670) is the diacritic form of mater-lectionis long
    // ā — used e.g. in "ٱللَّٰهُ" (Allāh) and "ٱلرَّحْمَٰنُ" (al-Raḥmān) where a
    // full alif letter isn't written. Without this, it's left for the
    // per-character loop's standalone DAGGER_ALIF case to also emit "ā",
    // duplicating the vowel (e.g. "laā" instead of "lā").
    base = 'ā';
    idx++;
  } else if (base === 'a' && chars[idx] === 'ة') {
    idx++; // tāʾ marbūṭa after fatha: still just "a", the ة is orthographic only
  } else if (
    base === 'u' &&
    chars[idx] === 'و' &&
    !VOWEL_CARRYING_MARKS.has(chars[idx + 1] ?? '')
  ) {
    base = 'ū';
    idx++;
  } else if (
    base === 'i' &&
    chars[idx] === 'ي' &&
    !VOWEL_CARRYING_MARKS.has(chars[idx + 1] ?? '')
  ) {
    base = 'ī';
    idx++;
    if (chars[idx] === SUKUN) idx++; // medial ī house-style sukūn (arabicHouseStyle.ts) — silent
  }

  return { vowel: base, consumed: idx - i, doubled };
}

function convertWord(word: string): string {
  const chars = Array.from(word);
  let i = 0;
  let out = '';
  // True only for the single consonant immediately after "al-": a shadda
  // there is sun-letter assimilation of the lām (الرَّحْمَان), not true root
  // gemination, and Brill convention always writes the unassimilated
  // "al-" in Latin regardless of Arabic pronunciation/orthography — so
  // that one shadda must not double the consonant the way a real
  // geminated root consonant would (see docs/METHODOLOGY.md).
  let suppressNextDoubling = false;

  // Definite article "ال" -> "al-" (also "ٱل", spelled with alif wasla —
  // see looksFullyDiacritized() above for why the two are equivalent here).
  if ((chars[0] === 'ا' || chars[0] === 'ٱ') && chars[1] === 'ل' && chars.length > 2) {
    out += 'al-';
    i = 2;
    // Moon letters carry an explicit sukūn on the lām; sun letters instead
    // put a shadda on the *following* consonant, handled by the normal
    // per-consonant loop below — nothing extra to skip for those.
    if (chars[i] === SUKUN) i++;
    else suppressNextDoubling = true;
  }

  while (i < chars.length) {
    const ch = chars[i] as string;
    const wasArticleBoundary = suppressNextDoubling;
    suppressNextDoubling = false;

    if (ch === DAGGER_ALIF) {
      out += 'ā';
      i++;
      continue;
    }

    if (ch === MADDA_ALIF) {
      out += 'ā';
      i++;
      continue;
    }

    if (HAMZA_SEATS.has(ch)) {
      i++;
      const { vowel, consumed, doubled } = readVowel(chars, i);
      out += doubled ? 'ʾʾ' + vowel : 'ʾ' + vowel;
      i += consumed;
      continue;
    }

    if (ch === 'ا' || ch === 'ٱ') {
      out += 'ā';
      i++;
      continue;
    }

    if (ch === 'ى') {
      out += 'ā';
      i++;
      continue;
    }

    if (ch === 'ة') {
      out += 'a';
      i++;
      continue;
    }

    if (ch in CONSONANTS) {
      const base = CONSONANTS[ch] as string;
      i++;
      const { vowel, consumed, doubled } = readVowel(chars, i);
      i += consumed;
      const emitDoubled = doubled && !wasArticleBoundary;
      out += emitDoubled ? base + base + vowel : base + vowel;
      continue;
    }

    // Unrecognised character (punctuation, digits, brackets): pass through.
    out += ch;
    i++;
  }

  return out;
}

/** Convert fully-diacritised Arabic script to Brill-style Latin transliteration. */
// Irregular whole-word reversals: the forward engine's lexical
// substitutions for these words can't be inverted character-by-character
// (see docs/METHODOLOGY.md "Known limitations"). "بْن" (medial, no alif —
// see ADR-008) and "ابْن" (name-initial, with alif) both correspond to
// Brill "ibn" — the convention keeps the epenthetic vowel in the Latin
// spelling in both positions, even though only the initial position keeps
// the alif in Arabic script.
const IRREGULAR_REVERSE_WORDS: Record<string, string> = {
  بْن: 'ibn',
  ابْن: 'ibn'
};

export function generateLatinFromArabic(value: string): string {
  return value
    .trim()
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim()) return part;
      return IRREGULAR_REVERSE_WORDS[part] ?? convertWord(part);
    })
    .join('');
}
