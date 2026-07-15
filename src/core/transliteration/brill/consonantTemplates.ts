/**
 * Applies the two repeating rule "templates" found throughout the Brill
 * engine — the geminated (shadda) consonant template and the
 * single-occurrence consonant template — driven by the data tables in
 * `consonantTable.ts`. Both templates, and every {latin, arabic} pair they
 * were generated from, were cross-validated byte-for-byte against the
 * original legacyEngine.mjs before this replaced it — see ADR-010 and the
 * header comment in consonantTable.ts.
 */
import type { ConsonantUnit } from './consonantTable.js';

const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SHADDA = '\u0651';
const SUKUN = '\u0652';

/**
 * Applies a geminated-consonant template for one {latin, arabic} unit.
 * A shadda is written *before* the vowel mark here (e.g. "bbā" -> بَّا is
 * ب + shadda + fatha + ا) — the ordering the original engine actually
 * uses for these rules (verified; do not "correct" to vowel-then-shadda
 * without re-validating against legacyEngine.mjs's archived source).
 */
function applyGeminationUnit(txt: string, unit: ConsonantUnit): string {
  const { latin: U, arabic: A } = unit;
  txt = txt.replaceAll(new RegExp(`${U}${U}ā`, 'gi'), `${A}${SHADDA}${FATHA}ا`);
  txt = txt.replaceAll(new RegExp(`${U}${U}ū`, 'gi'), `${A}${SHADDA}${DAMMA}و`);
  txt = txt.replaceAll(new RegExp(`${U}${U}ī`, 'gi'), `${A}${SHADDA}${KASRA}ي`);
  txt = txt.replaceAll(new RegExp(`${U}${U}a$`, 'gi'), `${A}${SHADDA}${FATHA}ة`);
  txt = txt.replaceAll(new RegExp(`${U}${U}a`, 'gi'), `${A}${SHADDA}${FATHA}`);
  txt = txt.replaceAll(new RegExp(`${U}${U}u`, 'gi'), `${A}${SHADDA}${DAMMA}`);
  txt = txt.replaceAll(new RegExp(`${U}${U}i`, 'gi'), `${A}${SHADDA}${KASRA}`);
  txt = txt.replaceAll(new RegExp(`${U}${U}`, 'gi'), `${A}${SHADDA}`);
  return txt;
}

/**
 * Applies a single-occurrence consonant template for one {latin, arabic}
 * unit: long vowels (mater lectionis), short vowels, tāʾ marbūṭa after a
 * fatha, and finally a bare sukūn — with the trailing sukūn stripped again
 * if it ends up at the very end of the word (a word-final consonant is
 * pausal, not marked, per this project's convention — see
 * docs/METHODOLOGY.md).
 */
function applySingleUnit(txt: string, unit: ConsonantUnit): string {
  const { latin: U, arabic: A } = unit;
  txt = txt.replaceAll(new RegExp(`${U}ā`, 'gi'), `${A}${FATHA}ا`);
  txt = txt.replaceAll(new RegExp(`${U}ū`, 'gi'), `${A}${DAMMA}و`);
  txt = txt.replaceAll(new RegExp(`${U}ī`, 'gi'), `${A}${KASRA}يْ`);
  txt = txt.replaceAll(new RegExp(`${U}a$`, 'gi'), `${A}${FATHA}ة`);
  txt = txt.replaceAll(new RegExp(`${U}a`, 'gi'), `${A}${FATHA}`);
  txt = txt.replaceAll(new RegExp(`${U}u`, 'gi'), `${A}${DAMMA}`);
  txt = txt.replaceAll(new RegExp(`${U}i`, 'gi'), `${A}${KASRA}`);
  txt = txt.replaceAll(new RegExp(`${U}`, 'gi'), `${A}${SUKUN}`);
  txt = txt.replace(new RegExp(`${A}${SUKUN}$`, 'gi'), A);
  return txt;
}

/** Applies the geminated-consonant template for every unit in `table`, in order. */
export function applyGeminationTable(txt: string, table: ConsonantUnit[]): string {
  for (const unit of table) txt = applyGeminationUnit(txt, unit);
  return txt;
}

/** Applies the single-occurrence consonant template for every unit in `table`, in order. */
export function applySingleTable(txt: string, table: ConsonantUnit[]): string {
  for (const unit of table) txt = applySingleUnit(txt, unit);
  return txt;
}
