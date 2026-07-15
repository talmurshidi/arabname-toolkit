import { DICTIONARY_BY_FIRST_WORD } from './dictionary.js';

export interface DictionaryToken {
  /** Non-letter characters attached to the front of the word (brackets, etc.). Only set for dictionary hits. */
  prefix: string;
  /** Final Arabic text if isDictionaryHit; otherwise the untouched original word (punctuation included). */
  text: string;
  /** Non-letter characters attached to the end of the word (brackets, "?", etc.). Only set for dictionary hits. */
  suffix: string;
  isDictionaryHit: boolean;
}

export interface DictionaryMatchResult {
  tokens: DictionaryToken[];
  /** Whitespace runs between tokens; separators[k] follows tokens[k]. */
  separators: string[];
  unmatchedWordCount: number;
}

interface SplitWord {
  prefix: string;
  core: string;
  suffix: string;
}

/**
 * Splits a whitespace-delimited word into leading/trailing punctuation
 * (brackets, "?", etc.) and the Latin "core", used only to test for a
 * dictionary match. This split is deliberately not used for words that fall
 * through to the legacy fallback engine — that engine has its own punctuation
 * handling which depends on receiving the word exactly as it originally appeared.
 */
function splitPunctuation(word: string): SplitWord {
  const leadingMatch = /^[^\p{L}]*/u.exec(word)?.[0] ?? '';
  const rest = word.slice(leadingMatch.length);
  const trailingMatch = /[^\p{L}]*$/u.exec(rest)?.[0] ?? '';
  const core = trailingMatch ? rest.slice(0, -trailingMatch.length) : rest;
  return { prefix: leadingMatch, core, suffix: trailingMatch };
}

/**
 * Greedy longest-match-first scan over word tokens against the
 * TRANSLITERATION_DICTIONARY. Case-insensitive on the lookup key, but the
 * dictionary's own Arabic values are returned verbatim. Leading/trailing
 * punctuation on a word (e.g. "(Zajjaj?)") is stripped only to test for a
 * match and is reattached around a dictionary hit's Arabic value; a word
 * with no dictionary match is passed through to the fallback engine
 * completely unchanged, punctuation included.
 */
export function dictionaryTransliterate(text: string): DictionaryMatchResult {
  if (!text) {
    return { tokens: [], separators: [], unmatchedWordCount: 0 };
  }

  const parts = text.split(/(\s+)/);
  const words: string[] = [];
  const wordSeparators: string[] = [];
  parts.forEach((part, idx) => {
    if (idx % 2 === 0) words.push(part);
    else wordSeparators.push(part);
  });

  const split = words.map(splitPunctuation);

  const tokens: DictionaryToken[] = [];
  const separators: string[] = [];
  let unmatchedWordCount = 0;
  let i = 0;

  while (i < words.length) {
    const word = words[i] ?? '';
    const current = split[i] ?? { prefix: '', core: '', suffix: '' };

    if (current.core.length === 0) {
      tokens.push({ prefix: '', text: word, suffix: '', isDictionaryHit: false });
      if (i < wordSeparators.length) separators.push(wordSeparators[i] ?? '');
      i += 1;
      continue;
    }

    const candidates = DICTIONARY_BY_FIRST_WORD.get(current.core.toLowerCase());
    let matched: { words: string[]; arabic: string } | undefined;

    if (candidates) {
      for (const candidate of candidates) {
        if (i + candidate.words.length > split.length) continue;
        let isMatch = true;
        for (let offset = 0; offset < candidate.words.length; offset++) {
          if (
            (split[i + offset]?.core ?? '').toLowerCase() !== candidate.words[offset]?.toLowerCase()
          ) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          matched = candidate;
          break;
        }
      }
    }

    if (matched) {
      const lastConsumedIndex = i + matched.words.length - 1;
      const trailingSuffix = split[lastConsumedIndex]?.suffix ?? '';
      tokens.push({
        prefix: current.prefix,
        text: matched.arabic,
        suffix: trailingSuffix,
        isDictionaryHit: true
      });
      if (lastConsumedIndex < wordSeparators.length)
        separators.push(wordSeparators[lastConsumedIndex] ?? '');
      i += matched.words.length;
    } else {
      tokens.push({ prefix: '', text: word, suffix: '', isDictionaryHit: false });
      unmatchedWordCount += 1;
      if (i < wordSeparators.length) separators.push(wordSeparators[i] ?? '');
      i += 1;
    }
  }

  return { tokens, separators, unmatchedWordCount };
}

/**
 * Reassembles tokens into a single string, applying `transformUnmatched` to
 * any token that was not a dictionary hit (e.g. running it through the legacy
 * per-word fallback engine, unchanged punctuation and all) and leaving
 * dictionary hits untouched. A dictionary hit's stripped prefix/suffix
 * punctuation is reattached around its Arabic value.
 */
export function reassembleDictionaryTokens(
  result: DictionaryMatchResult,
  transformUnmatched: (word: string) => string
): string {
  let output = '';
  for (let idx = 0; idx < result.tokens.length; idx++) {
    const token = result.tokens[idx];
    if (!token) continue;
    output += token.isDictionaryHit
      ? token.prefix + token.text + token.suffix
      : transformUnmatched(token.text);
    if (idx < result.separators.length) output += result.separators[idx] ?? '';
  }
  return output;
}
