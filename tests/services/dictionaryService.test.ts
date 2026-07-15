import { describe, expect, it, beforeEach, vi } from 'vitest';
import { DictionaryService } from '../../src/services/DictionaryService.js';

function makeLocalStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    }
  } as Storage;
}

describe('DictionaryService', () => {
  let svc: DictionaryService;

  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorageStub());
    vi.stubGlobal('crypto', { randomUUID: () => Math.random().toString(36).slice(2) });
    svc = new DictionaryService();
  });

  it('starts empty', () => {
    expect(svc.getAll()).toEqual([]);
  });

  it('add creates an entry with arabic (stripped) and id', () => {
    const entry = svc.add({ latin: 'Muḥammad', arabicHarakat: 'مُحَمَّد' });
    expect(entry.id).toBeTruthy();
    expect(entry.latin).toBe('Muḥammad');
    expect(entry.arabicHarakat).toBe('مُحَمَّد');
    // arabic is harakat-stripped
    expect(entry.arabic).toBe('محمد');
    expect(svc.getAll()).toHaveLength(1);
  });

  it('add rejects a duplicate latin form (case-insensitive)', () => {
    svc.add({ latin: 'Muḥammad', arabicHarakat: 'مُحَمَّد' });
    expect(() => svc.add({ latin: 'muḥammad', arabicHarakat: 'مُحَمَّد' })).toThrow(
      /already exists/
    );
  });

  it('add rejects an empty latin form', () => {
    expect(() => svc.add({ latin: '  ', arabicHarakat: 'مُحَمَّد' })).toThrow(/must not be empty/);
  });

  it('update changes fields and recalculates arabic', () => {
    const entry = svc.add({ latin: 'Muḥammad', arabicHarakat: 'مُحَمَّد' });
    const updated = svc.update(entry.id, { arabicHarakat: 'مُحَمَّدٌ' });
    expect(updated.arabicHarakat).toBe('مُحَمَّدٌ');
    expect(updated.arabic).toBe('محمد');
    // Untouched fields survive
    expect(updated.latin).toBe('Muḥammad');
  });

  it('update throws for an unknown id', () => {
    expect(() => svc.update('nonexistent', { arabicHarakat: 'x' })).toThrow(/not found/);
  });

  it('remove deletes by id and returns true', () => {
    const entry = svc.add({ latin: 'Test', arabicHarakat: 'تَسْت' });
    expect(svc.remove(entry.id)).toBe(true);
    expect(svc.getAll()).toHaveLength(0);
  });

  it('remove returns false for an unknown id', () => {
    expect(svc.remove('ghost')).toBe(false);
  });

  it('lookup finds by latin (case-insensitive)', () => {
    svc.add({ latin: 'Muḥammad', arabicHarakat: 'مُحَمَّد' });
    expect(svc.lookup('muḥammad')?.latin).toBe('Muḥammad');
    expect(svc.lookup('NotThere')).toBeUndefined();
  });

  it('exportJson round-trips through importJson', () => {
    svc.add({ latin: 'A', arabicHarakat: 'أ' });
    svc.add({ latin: 'B', arabicHarakat: 'ب' });
    const json = svc.exportJson();

    const svc2 = new DictionaryService({ storageKey: 'ant:user-dictionary-2' });
    const count = svc2.importJson(json);
    expect(count).toBe(2);
    expect(svc2.getAll()).toHaveLength(2);
  });

  it('importJson skips duplicates silently', () => {
    svc.add({ latin: 'A', arabicHarakat: 'أ' });
    const json = svc.exportJson();
    // Re-import into same service — should skip the duplicate
    const count = svc.importJson(json);
    expect(count).toBe(0);
    expect(svc.getAll()).toHaveLength(1);
  });

  it('importJson throws on non-array JSON', () => {
    expect(() => svc.importJson('{"foo":"bar"}')).toThrow(/Expected a JSON array/);
  });

  it('getAll returns empty array on malformed localStorage', () => {
    localStorage.setItem('ant:user-dictionary', 'INVALID');
    expect(svc.getAll()).toEqual([]);
  });
});
