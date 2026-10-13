import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Element } from '../data/elements';
import { Badge, getBadgeById } from '../data/badges';
import { gameReducer, getPendingElement, resolveCombination, GameState } from '../game/state';
import { loadGame, saveGame, parseSave, serializeSave, LoadStatus } from '../game/save';

export type { GameState } from '../game/state';

export interface Notice {
  kind: 'invalid' | 'known' | 'skipped';
  text: string;
}

const SAVE_DEBOUNCE_MS = 100;
const TICK_MS = 15_000;

export interface UseGame {
  gameState: GameState;
  loadStatus: LoadStatus;
  /** Ids in the two combination slots; the same id may appear twice. */
  selectedElements: string[];
  notice: Notice | null;
  /** Element found by combining whose puzzle is still open. */
  pendingElement: Element | null;
  /** Element the player just named correctly; shown until dismissed. */
  lastSolved: Element | null;
  activeBadge: Badge | null;
  selectElement: (id: string) => void;
  removeSelected: (slotIndex: number) => void;
  clearSelection: () => void;
  combine: () => void;
  solveWord: (wrongAttempts: number) => void;
  skipWord: () => void;
  dismissSolved: () => void;
  dismissBadge: () => void;
  completeTutorial: () => void;
  toggleHints: () => void;
  exportSave: () => string;
  importSave: (text: string) => boolean;
  resetGame: () => void;
}

export function useGame(): UseGame {
  const [initial] = useState(() => loadGame());
  const [gameState, dispatch] = useReducer(gameReducer, initial.state);

  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastSolved, setLastSolved] = useState<Element | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);

  const pendingElement = useMemo(() => getPendingElement(gameState), [gameState]);

  // Persistence: debounced write on change, immediate flush when the page is hidden or closed.
  const latestState = useRef(gameState);
  useEffect(() => {
    latestState.current = gameState;
    const timeoutId = setTimeout(() => saveGame(gameState), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  useEffect(() => {
    const flush = () => saveGame(latestState.current);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Play time only counts while the tab is visible.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        dispatch({ type: 'tick', elapsedMs: TICK_MS, now: Date.now() });
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Badges are granted by the reducer; this only turns newly granted ones into a celebration queue.
  const announcedBadges = useRef(new Set(initial.state.badges));
  useEffect(() => {
    const fresh = gameState.badges.filter(id => !announcedBadges.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach(id => announcedBadges.current.add(id));
    setBadgeQueue(queue => [...queue, ...fresh]);
  }, [gameState.badges]);

  const clearTransientUi = useCallback(() => {
    setSelectedElements([]);
    setNotice(null);
    setLastSolved(null);
    setBadgeQueue([]);
  }, []);

  const selectElement = useCallback((id: string) => {
    setNotice(null);
    setSelectedElements(prev => (prev.length >= 2 ? [id] : [...prev, id]));
  }, []);

  const removeSelected = useCallback((slotIndex: number) => {
    setSelectedElements(prev => prev.filter((_, index) => index !== slotIndex));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
    setNotice(null);
  }, []);

  const combine = useCallback(() => {
    if (selectedElements.length !== 2 || pendingElement) return;
    const [a, b] = selectedElements;
    const outcome = resolveCombination(gameState, a, b);
    dispatch({ type: 'combine', a, b, now: Date.now() });
    setSelectedElements([]);
    if (outcome.kind === 'invalid') {
      setNotice({ kind: 'invalid', text: 'Aus dieser Kombination entsteht nichts.' });
    } else if (outcome.kind === 'known') {
      setNotice({ kind: 'known', text: `Diese Kombination kennst du schon: ${outcome.element.name}.` });
    } else {
      setNotice(null);
    }
  }, [selectedElements, pendingElement, gameState]);

  const solveWord = useCallback((wrongAttempts: number) => {
    if (!pendingElement) return;
    dispatch({ type: 'solve', elementId: pendingElement.id, wrongAttempts, now: Date.now() });
    setLastSolved(pendingElement);
  }, [pendingElement]);

  const skipWord = useCallback(() => {
    if (!pendingElement) return;
    dispatch({ type: 'skip', elementId: pendingElement.id });
    setNotice({ kind: 'skipped', text: 'Übersprungen. Kombiniere die Elemente nochmal, um es erneut zu versuchen.' });
  }, [pendingElement]);

  const dismissSolved = useCallback(() => setLastSolved(null), []);
  const dismissBadge = useCallback(() => setBadgeQueue(queue => queue.slice(1)), []);

  const completeTutorial = useCallback(() => dispatch({ type: 'completeTutorial', now: Date.now() }), []);
  const toggleHints = useCallback(() => dispatch({ type: 'toggleHints' }), []);

  const exportSave = useCallback((): string => {
    dispatch({ type: 'markDataTransferred', now: Date.now() });
    return serializeSave(gameState);
  }, [gameState]);

  const importSave = useCallback((text: string): boolean => {
    const imported = parseSave(text);
    if (!imported) return false;
    // Badges that come with the file are not news; only ones earned by the import itself are.
    announcedBadges.current = new Set(imported.badges);
    clearTransientUi();
    dispatch({ type: 'replace', state: imported, now: Date.now() });
    return true;
  }, [clearTransientUi]);

  const resetGame = useCallback(() => {
    announcedBadges.current = new Set();
    clearTransientUi();
    dispatch({ type: 'reset', now: Date.now() });
  }, [clearTransientUi]);

  const activeBadge = badgeQueue.length > 0 ? getBadgeById(badgeQueue[0]) ?? null : null;

  return {
    gameState,
    loadStatus: initial.status,
    selectedElements,
    notice,
    pendingElement,
    lastSolved,
    activeBadge,
    selectElement,
    removeSelected,
    clearSelection,
    combine,
    solveWord,
    skipWord,
    dismissSolved,
    dismissBadge,
    completeTutorial,
    toggleHints,
    exportSave,
    importSave,
    resetGame,
  };
}
