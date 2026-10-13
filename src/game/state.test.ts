import { describe, expect, it } from 'vitest';
import { elements, BASIC_ELEMENT_IDS, getCombinableElements } from '../data/elements';
import { badges } from '../data/badges';
import { createInitialState, findEarnedBadges, gameReducer, getPendingElement, resolveCombination, GameState } from './state';

const NOON = new Date(2026, 0, 15, 12, 0, 0).getTime();

const combine = (state: GameState, a: string, b: string) => gameReducer(state, { type: 'combine', a, b, now: NOON });
const solve = (state: GameState, elementId: string, wrongAttempts = 0) =>
  gameReducer(state, { type: 'solve', elementId, wrongAttempts, now: NOON });

describe('combining', () => {
  it('lets an element be combined with itself', () => {
    const state = combine(createInitialState(NOON), 'feuer', 'feuer');
    expect(getPendingElement(state)?.id).toBe('energie');
    expect(state.discoveredElements).toContain('energie');
    expect(state.unlockedElements).not.toContain('energie');
  });

  it('blocks further combinations while a puzzle is open', () => {
    const open = combine(createInitialState(NOON), 'feuer', 'wasser');
    expect(resolveCombination(open, 'erde', 'luft').kind).toBe('invalid');
    expect(combine(open, 'erde', 'luft')).toEqual({ ...open, streak: 0 });
  });

  it('ignores elements that are not unlocked', () => {
    expect(resolveCombination(createInitialState(NOON), 'dampf', 'feuer').kind).toBe('invalid');
  });

  it('resets the streak on invalid and on already known combinations', () => {
    let state = solve(combine(createInitialState(NOON), 'feuer', 'wasser'), 'dampf');
    expect(state.streak).toBe(1);

    const known = combine(state, 'feuer', 'wasser');
    expect(resolveCombination(state, 'feuer', 'wasser').kind).toBe('known');
    expect(getPendingElement(known)).toBeNull();
    expect(known.streak).toBe(0);
    expect(known.discoveredElements).toEqual(state.discoveredElements);
    expect(known.maxStreak).toBe(1);

    state = solve(combine(state, 'feuer', 'erde'), 'lava');
    expect(state.streak).toBe(2);
    expect(combine(state, 'feuer', 'feuer').streak).toBe(3);
    expect(combine(state, 'feuer', 'stein').streak).toBe(0);
  });
});

describe('solving', () => {
  it('unlocks the open element and counts the puzzle once', () => {
    const open = combine(createInitialState(NOON), 'feuer', 'wasser');
    const solved = solve(open, 'dampf', 0);
    expect(solved.unlockedElements).toContain('dampf');
    expect(solved.wordsSolved).toBe(1);
    expect(solved.perfectWords).toBe(1);
    expect(getPendingElement(solved)).toBeNull();
  });

  it('is idempotent: replaying a solved puzzle changes nothing', () => {
    const solved = solve(combine(createInitialState(NOON), 'feuer', 'wasser'), 'dampf');
    expect(solve(solved, 'dampf')).toBe(solved);
  });

  it('only accepts the element whose puzzle is open', () => {
    const open = combine(createInitialState(NOON), 'feuer', 'wasser');
    expect(solve(open, 'lava')).toBe(open);
  });

  it('records mistakes and does not count imperfect puzzles as perfect', () => {
    const solved = solve(combine(createInitialState(NOON), 'feuer', 'wasser'), 'dampf', 3);
    expect(solved.mistakes).toBe(3);
    expect(solved.perfectWords).toBe(0);
    expect(solved.wordsSolved).toBe(1);
  });
});

describe('skipping', () => {
  it('returns the element to undiscovered without unlocking it', () => {
    const open = combine(createInitialState(NOON), 'feuer', 'wasser');
    const skipped = gameReducer(open, { type: 'skip', elementId: 'dampf' });
    expect(getPendingElement(skipped)).toBeNull();
    expect(skipped.discoveredElements).not.toContain('dampf');
    expect(skipped.unlockedElements).not.toContain('dampf');
    expect(skipped.wordsSolved).toBe(0);
    // ...and it can be found again.
    expect(resolveCombination(skipped, 'feuer', 'wasser').kind).toBe('new');
  });

  it('does nothing when no puzzle is open', () => {
    const state = createInitialState(NOON);
    expect(gameReducer(state, { type: 'skip', elementId: 'dampf' })).toBe(state);
  });
});

describe('badges', () => {
  it('grants badges from the state, once', () => {
    let state = solve(combine(createInitialState(NOON), 'feuer', 'wasser'), 'dampf');
    expect(state.badges).toEqual(expect.arrayContaining(['first-discovery', 'first-word', 'first-combo']));
    expect(new Set(state.badges).size).toBe(state.badges.length);
    const before = state.badges.length;
    state = gameReducer(state, { type: 'tick', elapsedMs: 15_000, now: NOON });
    expect(state.badges).toHaveLength(before);
  });

  it('grants the tutorial badge', () => {
    const state = gameReducer(createInitialState(NOON), { type: 'completeTutorial', now: NOON });
    expect(state.badges).toContain('tutorial');
  });

  it('grants the export badge when the save is exported or imported', () => {
    const exported = gameReducer(createInitialState(NOON), { type: 'markDataTransferred', now: NOON });
    expect(exported.badges).toContain('export-import');
    const imported = gameReducer(createInitialState(NOON), { type: 'replace', state: createInitialState(NOON), now: NOON });
    expect(imported.badges).toContain('export-import');
  });

  it('awards time-of-day badges from the supplied clock only', () => {
    const state = createInitialState(NOON);
    expect(findEarnedBadges(state, 12)).toEqual([]);
    expect(findEarnedBadges(state, 2)).toEqual(['night-owl']);
    expect(findEarnedBadges(state, 5)).toEqual(['early-bird']);
  });

  it('awards streak, word and combination thresholds from the counters', () => {
    const state = { ...createInitialState(NOON), maxStreak: 5, wordsSolved: 10, combinations: 50, perfectWords: 10 };
    expect(findEarnedBadges(state, 12)).toEqual(
      expect.arrayContaining(['streak-3', 'streak-5', 'ten-words', 'ten-combos', 'fifty-combos', 'perfect-words']),
    );
    expect(findEarnedBadges(state, 12)).not.toContain('streak-10');
  });
});

describe('housekeeping actions', () => {
  it('accumulates play time', () => {
    const state = gameReducer(createInitialState(NOON), { type: 'tick', elapsedMs: 15_000, now: NOON });
    expect(state.totalPlayTime).toBe(15_000);
    expect(state.lastPlayed).toBe(new Date(NOON).toISOString());
  });

  it('resets to a fresh game', () => {
    const played = solve(combine(createInitialState(NOON), 'feuer', 'wasser'), 'dampf');
    expect(gameReducer(played, { type: 'reset', now: NOON })).toEqual(createInitialState(NOON));
  });

  it('toggles hints', () => {
    const state = createInitialState(NOON);
    expect(gameReducer(state, { type: 'toggleHints' }).showHints).toBe(!state.showHints);
  });
});

describe('a complete playthrough', () => {
  it('unlocks all elements and every badge that does not depend on the clock or file transfer', () => {
    let state = createInitialState(NOON);
    let progressed = true;
    while (progressed) {
      progressed = false;
      const unlocked = state.unlockedElements;
      outer: for (let i = 0; i < unlocked.length; i++) {
        for (let j = i; j < unlocked.length; j++) {
          const result = getCombinableElements(unlocked[i], unlocked[j]);
          if (result && !state.discoveredElements.includes(result.id)) {
            state = solve(combine(state, unlocked[i], unlocked[j]), result.id, 0);
            progressed = true;
            break outer;
          }
        }
      }
    }
    expect(state.unlockedElements).toHaveLength(elements.length);
    expect(state.unlockedElements).toEqual(expect.arrayContaining([...BASIC_ELEMENT_IDS]));
    expect(state.badges).toContain('all-discoveries');

    state = gameReducer(state, { type: 'completeTutorial', now: NOON });
    state = gameReducer(state, { type: 'markDataTransferred', now: NOON });
    state = gameReducer(state, { type: 'tick', elapsedMs: 1, now: new Date(2026, 0, 15, 2).getTime() });
    state = gameReducer(state, { type: 'tick', elapsedMs: 1, now: new Date(2026, 0, 15, 5, 30).getTime() });
    expect(badges.filter(b => !state.badges.includes(b.id)).map(b => b.id)).toEqual([]);
  });
});
