/**
 * React binding for the framework-agnostic locale store in `@ui/i18n`.
 * Keeps `<html lang/dir>` in sync and re-renders subscribers on toggle.
 */
import { useSyncExternalStore } from 'react';
import type { Locale } from '@shared/types.js';
import { getLocale, subscribeLocale, t, toggleLocale, type UIStrings } from '@ui/i18n/index.js';

export interface UseLocaleResult {
  locale: Locale;
  strings: UIStrings;
  toggle: () => void;
}

export function useLocale(): UseLocaleResult {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);
  return { locale, strings: t(), toggle: () => toggleLocale() };
}
