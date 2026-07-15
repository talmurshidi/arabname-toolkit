/**
 * Scans the built-in TRANSLITERATION_DICTIONARY for entries whose Latin key
 * looks "degraded" — i.e., missing expected diacritics for the Brill standard.
 * Outputs a Markdown worklist to docs/reference/degraded-transliteration-candidates.md.
 *
 * Run via: tsx scripts/find-degraded-transliterations.ts
 *
 * This script is a diagnostic tool for dictionary maintainers, not part of
 * the runtime build. Findings must be verified against a citable source
 * before being added to src/core/transliteration/corrections.ts.
 *
 * Ported from TabaqatPerfect's find-degraded-transliterations.ts.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// We import directly from the source file since this script runs via tsx.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — tsx resolves this fine even though tsconfig.node.json targets CommonJS
import { TRANSLITERATION_DICTIONARY } from '../src/core/transliteration/dictionary.js';

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'reference', 'degraded-transliteration-candidates.md');

/**
 * Heuristic: a Brill-standard key should contain at least one diacritic marker
 * (macron, underdot, or ʿ/ʾ) for almost all Arabic names of more than 2 letters.
 * Keys that are suspiciously "plain ASCII" for their length are candidates for review.
 */
const BRILL_DIACRITICS = /[āūīĀŪĪḥḤṣṢḍḌṭṬẓẒʿʾ]/;

/** Single-word keys that are legitimately ASCII (short connectors, abbreviations). */
const KNOWN_PLAIN_EXCEPTIONS = new Set([
  'Ibn',
  'Bint',
  'Zajjaj',
  'Shadharat',
  'Tabaqat',
  'HibatallĀh'
]);

interface Candidate {
  latin: string;
  arabic: string;
  reason: string;
}

function analyze(): Candidate[] {
  const candidates: Candidate[] = [];

  for (const [latin, arabic] of Object.entries(
    TRANSLITERATION_DICTIONARY as Record<string, string>
  )) {
    // Skip al- prefixed entries — their diacritics are on the main word
    if (latin.startsWith('al-')) continue;
    if (KNOWN_PLAIN_EXCEPTIONS.has(latin)) continue;

    const words = latin.split(/\s+/);
    const nonConnectors = words.filter(
      (w) => !['al-', 'b.', 'bt.', 'wa-', 'wa'].includes(w.toLowerCase())
    );

    for (const word of nonConnectors) {
      const core = word.replace(/^(al-)/i, '');
      if (core.length > 4 && !BRILL_DIACRITICS.test(core)) {
        candidates.push({
          latin,
          arabic,
          reason: `"${word}" has no Brill diacritics (length ${core.length})`
        });
        break; // one finding per entry is enough
      }
    }
  }

  return candidates;
}

function render(candidates: Candidate[]): string {
  const now = new Date().toISOString();
  const lines: string[] = [
    '# Degraded transliteration candidates',
    '',
    `Auto-generated worklist from \`scripts/find-degraded-transliterations.ts\`. This is a **worklist for a human** — verify each row against a real, citable source before filling in "verified correct Latin form" / "source" / "verified Arabic". Leave a row blank if no citable source can be found; do not guess. Once verified, add the correction to \`src/core/transliteration/corrections.ts\` (keyed on the exact current latin form).`,
    '',
    `Generated: ${now} · Candidates found: ${candidates.length}`,
    '',
    '| Latin key | Current Arabic | Reason | Verified correct Latin | Source | Verified Arabic |',
    '|---|---|---|---|---|---|'
  ];

  for (const c of candidates) {
    lines.push(`| ${c.latin} | ${c.arabic} | ${c.reason} | | | |`);
  }

  return lines.join('\n') + '\n';
}

const candidates = analyze();
writeFileSync(OUTPUT, render(candidates), 'utf8');
console.log(`Wrote ${candidates.length} candidates to ${path.relative(ROOT, OUTPUT)}`);
