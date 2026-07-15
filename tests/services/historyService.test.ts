import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HistoryService } from '../../src/services/HistoryService.js';
import type { ConversionOutput } from '../../src/shared/types.js';

// ---------------------------------------------------------------------------
// localStorage stub — HistoryService is a browser service; Vitest runs in Node
// ---------------------------------------------------------------------------

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

function sampleOutput(input = 'Abū Bakr'): ConversionOutput {
  return {
    input,
    normalizedName: input,
    nameOrder: 'Abu Bakr',
    arabic: 'أبو بكر',
    arabicHarakat: 'أَبُو بَكْر',
    brillLatin: input,
    dinLatin: input,
    scheme: 'brill',
    direction: 'latin-to-arabic',
    ruleVersion: 'test-v1',
    timestamp: new Date().toISOString()
  };
}

describe('HistoryService', () => {
  let svc: HistoryService;

  beforeEach(() => {
    const stub = makeLocalStorageStub();
    vi.stubGlobal('localStorage', stub);
    vi.stubGlobal('crypto', { randomUUID: () => Math.random().toString(36).slice(2) });
    svc = new HistoryService({ maxEntries: 5 });
  });

  it('starts empty', () => {
    expect(svc.getAll()).toEqual([]);
  });

  it('push adds an entry and returns it with an id', () => {
    const entry = svc.push(sampleOutput());
    expect(entry.id).toBeTruthy();
    expect(entry.input).toBe('Abū Bakr');
    expect(svc.getAll()).toHaveLength(1);
  });

  it('getAll returns entries most-recent first', () => {
    svc.push(sampleOutput('First'));
    svc.push(sampleOutput('Second'));
    const all = svc.getAll();
    expect(all[0]?.input).toBe('Second');
    expect(all[1]?.input).toBe('First');
  });

  it('respects the maxEntries cap', () => {
    for (let i = 0; i < 7; i++) svc.push(sampleOutput(`Name${i}`));
    expect(svc.getAll()).toHaveLength(5);
    // Most recent entry should be Name6
    expect(svc.getAll()[0]?.input).toBe('Name6');
  });

  it('remove deletes by id and returns true', () => {
    const entry = svc.push(sampleOutput());
    expect(svc.remove(entry.id)).toBe(true);
    expect(svc.getAll()).toHaveLength(0);
  });

  it('remove returns false for an unknown id', () => {
    svc.push(sampleOutput());
    expect(svc.remove('nonexistent-id')).toBe(false);
    expect(svc.getAll()).toHaveLength(1);
  });

  it('clear empties all entries', () => {
    svc.push(sampleOutput('A'));
    svc.push(sampleOutput('B'));
    svc.clear();
    expect(svc.getAll()).toHaveLength(0);
  });

  it('survives malformed localStorage data without throwing', () => {
    localStorage.setItem('ant:history', 'NOT JSON {{{');
    expect(svc.getAll()).toEqual([]);
  });

  it('survives non-array JSON in localStorage without throwing', () => {
    localStorage.setItem('ant:history', JSON.stringify({ foo: 'bar' }));
    expect(svc.getAll()).toEqual([]);
  });
});
