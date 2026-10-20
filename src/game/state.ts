import { elements, getCombinableElements, getElementById, BASIC_ELEMENT_IDS, Element, ElementCategory } from '../data/elements';
import { badges } from '../data/badges';

export const SAVE_VERSION = 3;

export interface GameState {
  version: typeof SAVE_VERSION;
  /** Elements the player has found by combining (puzzle may still be open). */
  discoveredElements: string[];
  /** Elements whose name the player has solved; only these can be combined. */
  unlockedElements: string[];
  /** Number of successful recipes performed. */
  combinations: number;
  wordsSolved: number;
  /** Puzzles solved on the first attempt. */
  perfectWords: number;
  /** Wrong guesses in total. */
  mistakes: number;
  /** Lifetime wrong guesses per element, including skipped puzzles. */
  puzzleAttempts: Record<string, number>;
  tutorialDismissed: boolean;
  /** Consecutive new discoveries without a failed or redundant combination. */
  streak: number;
  maxStreak: number;
  tutorialCompleted: boolean;
  /** True once the save has been exported or imported (badge condition). */
  dataTransferred: boolean;
  badges: string[];
  /** ISO timestamp. */
  lastPlayed: string;
  /** Active play time in milliseconds. */
  totalPlayTime: number;
  showHints: boolean;
}

export const createInitialState = (now = Date.now()): GameState => ({
  version: SAVE_VERSION,
  discoveredElements: [...BASIC_ELEMENT_IDS],
  unlockedElements: [...BASIC_ELEMENT_IDS],
  combinations: 0,
  wordsSolved: 0,
  perfectWords: 0,
  mistakes: 0,
  puzzleAttempts: {},
  tutorialDismissed: false,
  streak: 0,
  maxStreak: 0,
  tutorialCompleted: false,
  dataTransferred: false,
  badges: [],
  lastPlayed: new Date(now).toISOString(),
  totalPlayTime: 0,
  showHints: true,
});

export type CombineOutcome =
  | { kind: 'invalid' }
  | { kind: 'known'; element: Element }
  | { kind: 'new'; element: Element };

/** The element whose puzzle is still open (found, but not yet named), if any. */
export function getPendingElement(state: GameState): Element | null {
  const unlocked = new Set(state.unlockedElements);
  const id = state.discoveredElements.find(candidate => !unlocked.has(candidate));
  return id ? getElementById(id) ?? null : null;
}

/** What combining two elements would do. Both must be unlocked and no puzzle may be open. */
export function resolveCombination(state: GameState, a: string, b: string): CombineOutcome {
  if (getPendingElement(state)) return { kind: 'invalid' };
  if (!state.unlockedElements.includes(a) || !state.unlockedElements.includes(b)) return { kind: 'invalid' };
  const element = getCombinableElements(a, b);
  if (!element) return { kind: 'invalid' };
  return state.discoveredElements.includes(element.id) ? { kind: 'known', element } : { kind: 'new', element };
}

export type GameAction =
  | { type: 'combine'; a: string; b: string; now: number }
  | { type: 'solve'; elementId: string; wrongAttempts: number; now: number }
  | { type: 'wrongGuess'; elementId: string; now: number }
  | { type: 'dismissTutorial'; now: number }
  | { type: 'replayTutorial'; now: number }
  | { type: 'skip'; elementId: string; now: number }
  | { type: 'completeTutorial'; now: number }
  | { type: 'toggleHints' }
  | { type: 'markDataTransferred'; now: number }
  | { type: 'tick'; elapsedMs: number; now: number }
  | { type: 'replace'; state: GameState; now: number }
  | { type: 'sync'; state: GameState }
  | { type: 'reset'; now: number };

const categoryOf = new Map<string, ElementCategory>(elements.map(e => [e.id, e.category]));

/** Ids of badges that the state qualifies for but does not own yet. */
export function findEarnedBadges(state: GameState, hour: number): string[] {
  const owned = new Set(state.badges);
  const discoveredNew = state.discoveredElements.filter(id => categoryOf.get(id) !== 'basic');
  const perCategory = new Map<string, number>();
  for (const id of discoveredNew) {
    const category = categoryOf.get(id);
    if (category) perCategory.set(category, (perCategory.get(category) ?? 0) + 1);
  }

  const earned: string[] = [];
  for (const badge of badges) {
    if (owned.has(badge.id)) continue;
    let metric: number;
    switch (badge.condition) {
      case 'discovered': metric = discoveredNew.length; break;
      case 'words': metric = state.wordsSolved; break;
      case 'combinations': metric = state.combinations; break;
      case 'streak': metric = state.maxStreak; break;
      case 'perfect': metric = state.perfectWords; break;
      case 'tutorial': metric = state.tutorialCompleted ? 1 : 0; break;
      case 'export': metric = state.dataTransferred ? 1 : 0; break;
      case 'night': metric = hour >= 0 && hour < 5 ? 1 : 0; break;
      case 'morning': metric = hour >= 5 && hour < 6 ? 1 : 0; break;
      default: metric = perCategory.get(badge.condition.slice('category-'.length)) ?? 0;
    }
    if (metric >= badge.requirement) earned.push(badge.id);
  }
  return earned;
}

const withBadges = (state: GameState, now: number): GameState => {
  const earned = findEarnedBadges(state, new Date(now).getHours());
  return earned.length === 0 ? state : { ...state, badges: [...state.badges, ...earned] };
};

function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'combine': {
      const outcome = resolveCombination(state, action.a, action.b);
      if (outcome.kind === 'invalid') {
        return state.streak === 0 ? state : { ...state, streak: 0 };
      }
      if (outcome.kind === 'known') {
        return { ...state, combinations: state.combinations + 1, streak: 0 };
      }
      const streak = state.streak + 1;
      return {
        ...state,
        discoveredElements: [...state.discoveredElements, outcome.element.id],
        combinations: state.combinations + 1,
        streak,
        maxStreak: Math.max(streak, state.maxStreak),
      };
    }
    case 'solve': {
      // Idempotent: only the open puzzle can be solved, and only once.
      if (getPendingElement(state)?.id !== action.elementId) return state;
      return {
        ...state,
        unlockedElements: [...state.unlockedElements, action.elementId],
        wordsSolved: state.wordsSolved + 1,
        perfectWords: (state.puzzleAttempts[action.elementId] ?? action.wrongAttempts) === 0 ? state.perfectWords + 1 : state.perfectWords,
        mistakes: state.mistakes + (state.puzzleAttempts[action.elementId] === undefined ? action.wrongAttempts : 0),
        puzzleAttempts: { ...state.puzzleAttempts, [action.elementId]: state.puzzleAttempts[action.elementId] ?? action.wrongAttempts },
      };
    }
    case 'wrongGuess':
      if (getPendingElement(state)?.id !== action.elementId) return state;
      return {
        ...state,
        mistakes: state.mistakes + 1,
        puzzleAttempts: { ...state.puzzleAttempts, [action.elementId]: (state.puzzleAttempts[action.elementId] ?? 0) + 1 },
      };
    case 'dismissTutorial':
      return { ...state, tutorialDismissed: true };
    case 'replayTutorial':
      return { ...state, tutorialDismissed: false };
    case 'skip': {
      // The element goes back to "undiscovered" so the player can find it again later.
      if (getPendingElement(state)?.id !== action.elementId) return state;
      return {
        ...state,
        discoveredElements: state.discoveredElements.filter(id => id !== action.elementId),
        streak: 0,
      };
    }
    case 'completeTutorial':
      return { ...state, tutorialCompleted: true, tutorialDismissed: true };
    case 'toggleHints':
      return { ...state, showHints: !state.showHints };
    case 'markDataTransferred':
      return state.dataTransferred ? state : { ...state, dataTransferred: true };
    case 'tick':
      return {
        ...state,
        totalPlayTime: state.totalPlayTime + Math.max(0, Math.min(action.elapsedMs, 60_000)),
        lastPlayed: new Date(action.now).toISOString(),
      };
    case 'replace':
      return { ...action.state, dataTransferred: true };
    case 'sync':
      return action.state;
    case 'reset':
      return createInitialState(action.now);
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const next = applyAction(state, action);
  // Badges are evaluated here, after every action that carries a clock reading, and nowhere else.
  if (action.type === 'reset' || !('now' in action)) return next;
  const timed = next !== state && action.type !== 'tick'
    ? { ...next, lastPlayed: new Date(action.now).toISOString() }
    : next;
  return withBadges(timed, action.now);
}
