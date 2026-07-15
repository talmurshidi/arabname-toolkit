/**
 * Thin browser-side wrapper over the core transliteration engine.
 * Adds timestamps, IDs, and the ConversionOutput contract.
 * Has no Node.js or database dependencies — safe for GitHub Pages.
 */
import {
  generateLatin,
  generateTransliteration,
  looksFullyDiacritized,
  stripHarakatDiacritics,
  createNameOrder,
  TRANSLITERATION_RULE_VERSION,
  dinToBrill,
  brillToDin,
  type TransliterationOptions
} from '@core/transliteration/index.js';
import type { ConversionInput, ConversionOutput, TransliterationScheme } from '@shared/types.js';
import { generateId, nowIso } from '@shared/utils.js';

export class TransliterationService {
  /**
   * Convert a single name (Brill or DIN 31635, per `input.scheme`) to Arabic.
   * DIN 31635 input is converted to Brill spelling first (see
   * `@core/transliteration/din31635.ts`) — the underlying engine always
   * operates on Brill. Throws if the input is blank after trimming.
   */
  convert(input: ConversionInput, options?: TransliterationOptions): ConversionOutput {
    const trimmed = input.text.trim();
    if (!trimmed) throw new Error('Input must not be empty.');

    const brillText = input.scheme === 'din31635' ? dinToBrill(trimmed) : trimmed;
    const result = generateTransliteration(brillText, options);
    const brillLatin = result.normalizedName;

    return {
      input: trimmed,
      normalizedName: result.normalizedName,
      nameOrder: result.nameOrder,
      arabic: result.arabic,
      arabicHarakat: result.arabicHarakat,
      brillLatin,
      dinLatin: brillToDin(brillLatin),
      scheme: input.scheme,
      direction: 'latin-to-arabic',
      ruleVersion: TRANSLITERATION_RULE_VERSION,
      timestamp: nowIso()
    };
  }

  /**
   * Convert multiple inputs. Never throws — errors are captured per-row.
   * Callers should inspect each item's `status` field.
   */
  convertMany(
    inputs: ConversionInput[],
    options?: TransliterationOptions
  ): Array<
    { input: ConversionInput; output: ConversionOutput } | { input: ConversionInput; error: string }
  > {
    return inputs.map((input) => {
      try {
        return { input, output: this.convert(input, options) };
      } catch (err) {
        return { input, error: err instanceof Error ? err.message : String(err) };
      }
    });
  }

  /**
   * Convert fully-diacritised Arabic script to Latin (reverse direction).
   * Returns a full `ConversionOutput` (same shape as `convert()`, so both
   * directions can share history storage) — both the Brill and DIN 31635
   * Latin spellings are always populated; `preferredScheme` only affects
   * which one `scheme` reports as primary for display/history purposes.
   * Throws if the input is blank or not fully diacritised — undiacritised
   * Arabic cannot be unambiguously reversed (see docs/METHODOLOGY.md).
   */
  convertReverse(text: string, preferredScheme: TransliterationScheme = 'brill'): ConversionOutput {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Input must not be empty.');
    if (!looksFullyDiacritized(trimmed)) {
      throw new Error('NOT_FULLY_DIACRITIZED');
    }
    const brillLatin = generateLatin(trimmed);
    const dinLatin = brillToDin(brillLatin);

    return {
      input: trimmed,
      normalizedName: brillLatin,
      nameOrder: createNameOrder(brillLatin),
      arabic: stripHarakatDiacritics(trimmed).trim(),
      arabicHarakat: trimmed,
      brillLatin,
      dinLatin,
      scheme: preferredScheme,
      direction: 'arabic-to-latin',
      ruleVersion: TRANSLITERATION_RULE_VERSION,
      timestamp: nowIso()
    };
  }

  /**
   * Returns the current rule version string. Useful for display and export.
   */
  getRuleVersion(): string {
    return TRANSLITERATION_RULE_VERSION;
  }

  /**
   * Generate a stable opaque ID for a conversion result. Useful when
   * storing results in history without a server round-trip.
   */
  generateResultId(): string {
    return generateId();
  }
}

/** Singleton instance for use across the UI layer. */
export const transliterationService = new TransliterationService();
