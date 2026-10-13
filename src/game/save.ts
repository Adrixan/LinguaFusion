import { elements, BASIC_ELEMENT_IDS } from '../data/elements';
import { BADGE_IDS } from '../data/badges';
import { createInitialState, GameState, SAVE_VERSION } from './state';

export const STORAGE_KEY = 'linguafusion-save';
/** Key used before the rebrand from "Alchemie Fusion"; still read so existing progress survives. */
export const LEGACY_STORAGE_KEY = 'alchemie-fusion-save';
export const CORRUPT_BACKUP_KEY = 'linguafusion-save-corrupt';
export const MAX_IMPORT_BYTES = 1_000_000;

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type LoadStatus = 'fresh' | 'loaded' | 'migrated' | 'recovered';

const KNOWN_ELEMENT_IDS: ReadonlySet<string> = new Set(elements.map(e => e.id));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const knownIds = (value: unknown, known: ReadonlySet<string>): string[] =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && known.has(id)) : [];

const unique = (ids: string[]): string[] => [...new Set(ids)];

const count = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 0), 1_000_000_000) : 0;

/**
 * Turns untrusted data (localStorage, an imported file) into a valid GameState.
 * Unknown fields and element/badge ids are dropped, invalid values fall back to defaults.
 * Returns null when the data does not look like a LinguaFusion save at all.
 */
export function sanitizeSave(raw: unknown, now = Date.now()): GameState | null {
  if (!isRecord(raw)) return null;
  if (!Array.isArray(raw.discoveredElements) && !Array.isArray(raw.unlockedElements)) return null;

  const unlocked = unique([...BASIC_ELEMENT_IDS, ...knownIds(raw.unlockedElements, KNOWN_ELEMENT_IDS)]);
  // Anything unlocked has been discovered; a discovered-but-unlocked-not element is an open puzzle.
  const discovered = unique([...BASIC_ELEMENT_IDS, ...knownIds(raw.discoveredElements, KNOWN_ELEMENT_IDS), ...unlocked]);

  const streak = count(raw.streak);
  const lastPlayed =
    typeof raw.lastPlayed === 'string' && !Number.isNaN(Date.parse(raw.lastPlayed))
      ? new Date(raw.lastPlayed).toISOString()
      : new Date(now).toISOString();

  return {
    version: SAVE_VERSION,
    discoveredElements: discovered,
    unlockedElements: unlocked,
    combinations: count(raw.combinations),
    wordsSolved: count(raw.wordsSolved),
    perfectWords: count(raw.perfectWords),
    mistakes: count(raw.mistakes),
    streak,
    maxStreak: Math.max(count(raw.maxStreak), streak),
    tutorialCompleted: raw.tutorialCompleted === true,
    dataTransferred: raw.dataTransferred === true,
    badges: unique(knownIds(raw.badges, BADGE_IDS)),
    lastPlayed,
    totalPlayTime: count(raw.totalPlayTime),
    showHints: raw.showHints !== false,
  };
}

export function serializeSave(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

/** Parses the text of an imported save file. Returns null for anything that is not a valid save. */
export function parseSave(text: string, now = Date.now()): GameState | null {
  if (text.length > MAX_IMPORT_BYTES) return null;
  try {
    return sanitizeSave(JSON.parse(text), now);
  } catch {
    return null;
  }
}

export function loadGame(storage: KeyValueStorage | undefined = safeLocalStorage(), now = Date.now()): { state: GameState; status: LoadStatus } {
  if (!storage) return { state: createInitialState(now), status: 'fresh' };
  try {
    const current = storage.getItem(STORAGE_KEY);
    const raw = current ?? storage.getItem(LEGACY_STORAGE_KEY);
    if (raw === null) return { state: createInitialState(now), status: 'fresh' };

    const state = parseSave(raw, now);
    if (state) return { state, status: current !== null ? 'loaded' : 'migrated' };

    // Keep the unreadable data so it can be inspected or repaired by hand, then start over.
    storage.setItem(CORRUPT_BACKUP_KEY, raw);
  } catch (e) {
    console.error('Failed to load save:', e);
  }
  return { state: createInitialState(now), status: 'recovered' };
}

export function saveGame(state: GameState, storage: KeyValueStorage | undefined = safeLocalStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

export function clearSave(storage: KeyValueStorage | undefined = safeLocalStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
    storage?.removeItem(LEGACY_STORAGE_KEY);
    storage?.removeItem(CORRUPT_BACKUP_KEY);
  } catch (e) {
    console.error('Failed to clear save:', e);
  }
}

// Accessing localStorage can throw (blocked site data, private mode), so every use goes through here.
function safeLocalStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
