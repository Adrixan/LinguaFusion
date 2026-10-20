import { describe, expect, it } from 'vitest';
import { createInitialState, GameState } from './state';
import {
  CORRUPT_BACKUP_KEY, LEGACY_STORAGE_KEY, MAX_IMPORT_BYTES, STORAGE_KEY,
  loadGame, parseSave, sanitizeSave, saveGame, serializeSave,
} from './save';

const NOW = Date.UTC(2026, 0, 15, 12);

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe('sanitizeSave', () => {
  it.each([null, undefined, 42, 'text', [], {}, { unlockedElements: null }, { foo: 'bar' }])(
    'rejects data that is not a save: %j',
    value => expect(sanitizeSave(value, NOW)).toBeNull(),
  );

  it('keeps a valid save unchanged', () => {
    const state: GameState = {
      ...createInitialState(NOW),
      unlockedElements: ['feuer', 'wasser', 'erde', 'luft', 'dampf'],
      discoveredElements: ['feuer', 'wasser', 'erde', 'luft', 'dampf'],
      wordsSolved: 1, combinations: 1, perfectWords: 1, badges: ['first-word'], totalPlayTime: 5000, showHints: false,
    };
    expect(sanitizeSave(JSON.parse(JSON.stringify(state)), NOW)).toEqual(state);
  });

  it('round-trips persisted puzzle attempts and tutorial dismissal', () => {
    const state = sanitizeSave({
      unlockedElements: [], discoveredElements: [], puzzleAttempts: { dampf: 2, unknown: 9 }, tutorialDismissed: true,
    }, NOW)!;
    expect(state.puzzleAttempts).toEqual({ dampf: 2 });
    expect(state.tutorialDismissed).toBe(true);
  });

  it('drops unknown ids and always keeps the basic elements', () => {
    const state = sanitizeSave({ unlockedElements: ['dampf', 'nonsense', 7], discoveredElements: [], badges: ['first-word', 'made-up'] }, NOW)!;
    expect(state.unlockedElements).toEqual(['feuer', 'wasser', 'erde', 'luft', 'dampf']);
    expect(state.badges).toEqual(['first-word']);
  });

  it('treats unlocked elements as discovered but keeps open puzzles open', () => {
    const state = sanitizeSave({ unlockedElements: ['lava'], discoveredElements: ['dampf'] }, NOW)!;
    expect(state.discoveredElements).toEqual(expect.arrayContaining(['lava', 'dampf']));
    expect(state.unlockedElements).not.toContain('dampf');
  });

  it('repairs invalid numbers and flags', () => {
    const state = sanitizeSave({
      unlockedElements: [], wordsSolved: -4, combinations: 'many', mistakes: Infinity, streak: 3, maxStreak: 1,
      tutorialCompleted: 'yes', showHints: 0, lastPlayed: 'not a date', totalPlayTime: 2.9,
    }, NOW)!;
    expect(state.wordsSolved).toBe(0);
    expect(state.combinations).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(state.streak).toBe(3);
    expect(state.maxStreak).toBe(3);
    expect(state.tutorialCompleted).toBe(false);
    expect(state.showHints).toBe(true); // only an explicit false turns hints off
    expect(state.lastPlayed).toBe(new Date(NOW).toISOString());
    expect(state.totalPlayTime).toBe(2);
  });

  it('does not copy unknown fields, including prototype keys', () => {
    const state = sanitizeSave(JSON.parse('{"unlockedElements":[],"__proto__":{"polluted":true},"extra":1}'), NOW)!;
    expect(state).not.toHaveProperty('extra');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('understands saves from before the rebrand', () => {
    const legacy = {
      unlockedElements: ['feuer', 'wasser', 'erde', 'luft'], discoveredElements: ['feuer', 'wasser', 'erde', 'luft', 'dampf'],
      combinations: 1, wordsSolved: 0, hintsUsed: 4, perfectWords: 0, streak: 1, maxStreak: 1, tutorialCompleted: true,
      badges: [], lastPlayed: '2025-12-01T10:00:00.000Z', totalPlayTime: 60000, lastSessionTime: 1, showHints: true,
    };
    const state = sanitizeSave(legacy, NOW)!;
    expect(state.tutorialCompleted).toBe(true);
    expect(state.totalPlayTime).toBe(60000);
    expect(state).not.toHaveProperty('hintsUsed');
    expect(state).not.toHaveProperty('lastSessionTime');
  });
});

describe('parseSave / serializeSave', () => {
  it('round-trips', () => {
    const state = createInitialState(NOW);
    expect(parseSave(serializeSave(state), NOW)).toEqual(state);
  });

  it('returns null for invalid JSON and oversized input', () => {
    expect(parseSave('{not json', NOW)).toBeNull();
    expect(parseSave(' '.repeat(MAX_IMPORT_BYTES + 1), NOW)).toBeNull();
  });
});

describe('loadGame', () => {
  it('starts fresh without a save', () => {
    expect(loadGame(fakeStorage(), NOW)).toEqual({ state: createInitialState(NOW), status: 'fresh', revision: 0 });
  });

  it('loads the current save', () => {
    const storage = fakeStorage();
    const state = { ...createInitialState(NOW), wordsSolved: 3 };
    saveGame(state, storage);
    expect(loadGame(storage, NOW)).toEqual({ state, status: 'loaded', revision: 0 });
  });

  it('migrates a save stored under the legacy key', () => {
    const storage = fakeStorage({ [LEGACY_STORAGE_KEY]: JSON.stringify({ unlockedElements: ['feuer'], wordsSolved: 7 }) });
    const { state, status } = loadGame(storage, NOW);
    expect(status).toBe('migrated');
    expect(state.wordsSolved).toBe(7);
  });

  it('prefers the current key over the legacy one', () => {
    const storage = fakeStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({ unlockedElements: [], wordsSolved: 1 }),
      [STORAGE_KEY]: JSON.stringify({ unlockedElements: [], wordsSolved: 2 }),
    });
    expect(loadGame(storage, NOW).state.wordsSolved).toBe(2);
  });

  it('recovers from a corrupt save and keeps a backup of it', () => {
    const corrupt = JSON.stringify({ unlockedElements: null });
    const storage = fakeStorage({ [STORAGE_KEY]: corrupt });
    expect(loadGame(storage, NOW)).toEqual({ state: createInitialState(NOW), status: 'recovered', revision: 0 });
    expect(storage.data.get(CORRUPT_BACKUP_KEY)).toBe(corrupt);
  });

  it('recovers from text that is not JSON', () => {
    expect(loadGame(fakeStorage({ [STORAGE_KEY]: '<<<' }), NOW).status).toBe('recovered');
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(loadGame(broken, NOW).state).toEqual(createInitialState(NOW));
    expect(() => saveGame(createInitialState(NOW), broken)).not.toThrow();
  });

  it('rejects stale revisioned writes and accepts the current revision', async () => {
    const { saveGameIfCurrent } = await import('./save');
    const storage = fakeStorage();
    const state = createInitialState(NOW);
    expect(saveGameIfCurrent(state, 0, storage)).toBe('saved');
    expect(saveGameIfCurrent({ ...state, wordsSolved: 2 }, 0, storage)).toBe('conflict');
    expect(saveGameIfCurrent({ ...state, wordsSolved: 1 }, 1, storage)).toBe('saved');
  });
});
