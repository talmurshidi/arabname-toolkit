/**
 * Stores the last N conversion results in localStorage.
 * Keys are namespaced under "ant:history:" to avoid collisions.
 */
import type { HistoryEntry, ConversionOutput } from '@shared/types.js';
import { generateId } from '@shared/utils.js';

const STORAGE_KEY = 'ant:history';
const MAX_ENTRIES = 50;

export class HistoryService {
  private readonly storageKey: string;
  private readonly maxEntries: number;

  constructor(options?: { storageKey?: string; maxEntries?: number }) {
    this.storageKey = options?.storageKey ?? STORAGE_KEY;
    this.maxEntries = options?.maxEntries ?? MAX_ENTRIES;
  }

  /** Add a conversion result to the history (most recent first). */
  push(output: ConversionOutput): HistoryEntry {
    const entry: HistoryEntry = { ...output, id: generateId() };
    const existing = this.getAll();
    const updated = [entry, ...existing].slice(0, this.maxEntries);
    this.persist(updated);
    return entry;
  }

  /** Return all stored entries (most recent first). */
  getAll(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as HistoryEntry[];
    } catch {
      return [];
    }
  }

  /** Remove a single entry by ID. Returns true if the entry existed. */
  remove(id: string): boolean {
    const existing = this.getAll();
    const updated = existing.filter((e) => e.id !== id);
    if (updated.length === existing.length) return false;
    this.persist(updated);
    return true;
  }

  /** Clear all history. */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  private persist(entries: HistoryEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }
}

export const historyService = new HistoryService();
