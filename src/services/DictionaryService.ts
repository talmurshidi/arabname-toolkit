/**
 * Manages user-supplied Latin → Arabic overrides.
 * Stored in localStorage and merged into lookups at query time.
 *
 * User entries take precedence over the built-in dictionary but not over
 * TRANSLITERATION_CORRECTIONS (sourced corrections always win).
 */
import type { UserDictionaryEntry } from '@shared/types.js';
import { generateId, nowIso, stripHarakat } from '@shared/utils.js';

const STORAGE_KEY = 'ant:user-dictionary';

export class DictionaryService {
  private readonly storageKey: string;

  constructor(options?: { storageKey?: string }) {
    this.storageKey = options?.storageKey ?? STORAGE_KEY;
  }

  /** Add a new user entry. Returns the stored entry with a generated ID. */
  add(entry: Omit<UserDictionaryEntry, 'id' | 'createdAt' | 'arabic'>): UserDictionaryEntry {
    const all = this.getAll();
    const latin = entry.latin.trim();
    if (!latin) throw new Error('Latin form must not be empty.');
    if (all.some((e) => e.latin.toLowerCase() === latin.toLowerCase())) {
      throw new Error(`An entry for "${latin}" already exists. Use update() to change it.`);
    }
    const newEntry: UserDictionaryEntry = {
      ...entry,
      latin,
      arabic: stripHarakat(entry.arabicHarakat),
      id: generateId(),
      createdAt: nowIso()
    };
    this.persist([...all, newEntry]);
    return newEntry;
  }

  /** Update an existing entry by ID. Throws if not found. */
  update(
    id: string,
    patch: Partial<Omit<UserDictionaryEntry, 'id' | 'createdAt'>>
  ): UserDictionaryEntry {
    const all = this.getAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Entry "${id}" not found.`);
    const existing = all[idx]!;
    const arabicHarakat = patch.arabicHarakat ?? existing.arabicHarakat;
    const updated: UserDictionaryEntry = {
      ...existing,
      ...patch,
      arabic: stripHarakat(arabicHarakat),
      arabicHarakat
    };
    all[idx] = updated;
    this.persist(all);
    return updated;
  }

  /** Remove an entry by ID. Returns true if it existed. */
  remove(id: string): boolean {
    const all = this.getAll();
    const updated = all.filter((e) => e.id !== id);
    if (updated.length === all.length) return false;
    this.persist(updated);
    return true;
  }

  /** Look up a Latin string (exact, case-insensitive). Returns undefined if not found. */
  lookup(latin: string): UserDictionaryEntry | undefined {
    return this.getAll().find((e) => e.latin.toLowerCase() === latin.trim().toLowerCase());
  }

  /** Return all user entries sorted by Latin form. */
  getAll(): UserDictionaryEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as UserDictionaryEntry[]) : [];
    } catch {
      return [];
    }
  }

  /** Export all entries as a JSON string. */
  exportJson(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import entries from a JSON string. Duplicates (by Latin form) are skipped.
   * Returns the count of new entries actually added.
   */
  importJson(json: string): number {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) throw new Error('Expected a JSON array.');
    const all = this.getAll();
    const existingLatins = new Set(all.map((e) => e.latin.toLowerCase()));
    let added = 0;
    for (const item of parsed) {
      const entry = item as UserDictionaryEntry;
      if (existingLatins.has(entry.latin?.toLowerCase())) continue;
      all.push({ ...entry, id: generateId(), createdAt: nowIso() });
      existingLatins.add(entry.latin.toLowerCase());
      added++;
    }
    this.persist(all);
    return added;
  }

  private persist(entries: UserDictionaryEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }
}

export const dictionaryService = new DictionaryService();
