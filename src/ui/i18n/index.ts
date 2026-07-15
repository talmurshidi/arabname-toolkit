/**
 * Locale management. Persists the user's language preference in localStorage.
 * Applies `dir="rtl"` / `lang="ar"` on the <html> element automatically.
 */
import type { Locale } from '@shared/types.js';
import type { UIStrings } from './types.js';
import { ar } from './ar.js';
import { en } from './en.js';

export type { UIStrings } from './types.js';

const STORAGE_KEY = 'ant:locale';
const STRINGS: Record<Locale, UIStrings> = { ar, en };

/** Detect initial locale: stored preference → browser language → Arabic default. */
function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  const lang = navigator.language.slice(0, 2).toLowerCase();
  return lang === 'ar' ? 'ar' : 'en';
}

let currentLocale: Locale = 'ar';
const listeners = new Set<() => void>();

/** Subscribe to locale changes. Returns an unsubscribe function. Used by useLocale(). */
export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Get the current locale. */
export function getLocale(): Locale {
  return currentLocale;
}

/** Get the UI strings for the current locale. */
export function t(): UIStrings {
  return STRINGS[currentLocale];
}

/** Get a nested string by dot-separated key (e.g. 'converter.convertBtn'). */
export function tKey(key: string): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = STRINGS[currentLocale];
  for (const part of parts) {
    node = node?.[part];
  }
  return typeof node === 'string' ? node : key;
}

/**
 * Switch locale and update the <html> element.
 * Persists preference to localStorage.
 * Callers are responsible for re-rendering the page or updating DOM strings.
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  applyToDocument(locale);
  listeners.forEach((listener) => listener());
}

/** Toggle between 'ar' and 'en'. */
export function toggleLocale(): Locale {
  const next: Locale = currentLocale === 'ar' ? 'en' : 'ar';
  setLocale(next);
  return next;
}

/** Apply dir/lang attributes to <html>. Call once on page load. */
export function applyToDocument(locale: Locale = currentLocale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

/** Initialise locale on page load. Call before any UI rendering. */
export function initLocale(): Locale {
  currentLocale = detectLocale();
  applyToDocument(currentLocale);
  return currentLocale;
}
