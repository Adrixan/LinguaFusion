import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Element } from '../data/elements';
import { Badge, getBadgeById } from '../data/badges';
import { gameReducer, getPendingElement, resolveCombination, GameAction, GameState } from '../game/state';
import { loadGame, saveGameIfCurrent, parseSave, serializeSave, LoadStatus, STORAGE_KEY } from '../game/save';

export type { GameState } from '../game/state';

export interface Notice {
  kind: 'invalid' | 'known' | 'skipped' | 'selection';
  text: string;
}

const SAVE_DEBOUNCE_MS = 100;
const TICK_MS = 5_000;

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
  wrongGuess: () => void;
  skipWord: () => void;
  dismissSolved: () => void;
  dismissBadge: () => void;
  completeTutorial: () => void;
  dismissTutorial: () => void;
  replayTutorial: () => void;
  toggleHints: () => void;
  reviewVocabulary: (elementId: string, rating: 'again' | 'good' | 'easy') => void;
  exportSave: () => string;
  importSave: (text: string) => boolean;
  resetGame: () => void;
  persistenceError: boolean;
  saveConflict: boolean;
}

export function useGame(): UseGame {
  const [initial] = useState(() => loadGame());
  const [gameState, dispatch] = useReducer(gameReducer, initial.state);
  const revision = useRef(initial.revision);
  const pendingActions = useRef<GameAction[]>([]);
  const skipNextSave = useRef(false);
  const hasSaved = useRef(false);

  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastSolved, setLastSolved] = useState<Element | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [persistenceError, setPersistenceError] = useState(false);
  const [saveConflict, setSaveConflict] = useState(false);

  const pendingElement = useMemo(() => getPendingElement(gameState), [gameState]);
  const dispatchLocal = useCallback((action: GameAction) => {
    const stored = loadGame();
    if (stored.revision > revision.current) {
      revision.current = stored.revision;
      latestState.current = stored.state;
      pendingActions.current = [];
      dispatch({ type: 'sync', state: stored.state });
    }
    pendingActions.current.push(action);
    latestState.current = gameReducer(latestState.current, action);
    dispatch(action);
  }, []);

  // Persistence: debounced write on change, immediate flush when the page is hidden or closed.
  const latestState = useRef(gameState);
  useEffect(() => {
    latestState.current = gameState;
    if (skipNextSave.current && pendingActions.current.length === 0) {
      skipNextSave.current = false;
      return;
    }
    skipNextSave.current = false;
    const timeoutId = setTimeout(() => {
      if (pendingActions.current.length === 0 && hasSaved.current) return;
      const result = saveGameIfCurrent(latestState.current, revision.current);
      if (result === 'saved') {
        revision.current += 1;
        pendingActions.current = [];
        hasSaved.current = true;
        setSaveConflict(false);
      }
      setPersistenceError(result === 'unavailable');
      setSaveConflict(result === 'conflict');
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  useEffect(() => {
    const flush = () => {
      if (pendingActions.current.length === 0 && hasSaved.current) return;
      const result = saveGameIfCurrent(latestState.current, revision.current);
      if (result === 'saved') {
        revision.current += 1;
        pendingActions.current = [];
        hasSaved.current = true;
        setSaveConflict(false);
      }
      setPersistenceError(result === 'unavailable');
      setSaveConflict(result === 'conflict');
    };
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

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const raw: unknown = event.newValue ? JSON.parse(event.newValue) : null;
        const remote = raw ? parseSave(JSON.stringify(raw)) : loadGame().state;
        if (!remote) return;
        const remoteRevision = raw && typeof raw === 'object' && 'revision' in raw && typeof raw.revision === 'number' ? raw.revision : 0;
        if (remoteRevision <= revision.current && event.newValue !== null) return;
        revision.current = remoteRevision;
        hasSaved.current = true;
        // A remote snapshot may be a reset/import. Never replay old gameplay over it.
        const hadPendingActions = pendingActions.current.length > 0;
        pendingActions.current = [];
        latestState.current = remote;
        setSelectedElements([]);
        setLastSolved(null);
        setBadgeQueue([]);
        setNotice({ kind: 'known', text: 'Spielstand aus einem anderen Tab übernommen.' });
        skipNextSave.current = true;
        dispatch({ type: 'sync', state: remote });
        setSaveConflict(hadPendingActions);
      } catch (error) {
        console.error('Could not synchronize save from another tab:', error);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Count actual visible elapsed time and flush partial intervals on hide/page exit.
  useEffect(() => {
    let startedAt = document.visibilityState === 'visible' ? performance.now() : null;
    const flush = () => {
      if (startedAt === null) return;
      const elapsedMs = Math.round(performance.now() - startedAt);
      startedAt = performance.now();
      if (elapsedMs > 0) dispatchLocal({ type: 'tick', elapsedMs, now: Date.now() });
    };
    const interval = window.setInterval(flush, TICK_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        startedAt = null;
      } else {
        startedAt = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [dispatchLocal]);

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
    if (selectedElements.length >= 2) setNotice({ kind: 'selection', text: 'Die beiden Slots wurden durch deine neue Auswahl ersetzt.' });
    setSelectedElements(prev => prev.length < 2 ? [...prev, id] : [id]);
  }, [selectedElements.length]);

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
    dispatchLocal({ type: 'combine', a, b, now: Date.now() });
    setSelectedElements([]);
    if (outcome.kind === 'invalid') {
      setNotice({ kind: 'invalid', text: 'Aus dieser Kombination entsteht nichts.' });
    } else if (outcome.kind === 'known') {
      setNotice({ kind: 'known', text: `Diese Kombination kennst du schon: ${outcome.element.name}.` });
    } else {
      setNotice(null);
    }
  }, [selectedElements, pendingElement, gameState, dispatchLocal]);

  const solveWord = useCallback((wrongAttempts: number) => {
    if (!pendingElement) return;
    dispatchLocal({ type: 'solve', elementId: pendingElement.id, wrongAttempts, now: Date.now() });
    setLastSolved(pendingElement);
  }, [pendingElement, dispatchLocal]);

  const wrongGuess = useCallback(() => {
    if (!pendingElement) return;
    dispatchLocal({ type: 'wrongGuess', elementId: pendingElement.id, now: Date.now() });
  }, [pendingElement, dispatchLocal]);

  const skipWord = useCallback(() => {
    if (!pendingElement) return;
    dispatchLocal({ type: 'skip', elementId: pendingElement.id, now: Date.now() });
    setNotice({ kind: 'skipped', text: `Übersprungen. Kombiniere die Elemente nochmal, um es erneut zu versuchen. Bisherige Fehlversuche: ${gameState.puzzleAttempts[pendingElement.id] ?? 0}.` });
  }, [pendingElement, gameState.puzzleAttempts, dispatchLocal]);

  const dismissSolved = useCallback(() => setLastSolved(null), []);
  const dismissBadge = useCallback(() => setBadgeQueue(queue => queue.slice(1)), []);

  const completeTutorial = useCallback(() => dispatchLocal({ type: 'completeTutorial', now: Date.now() }), [dispatchLocal]);
  const dismissTutorial = useCallback(() => dispatchLocal({ type: 'dismissTutorial', now: Date.now() }), [dispatchLocal]);
  const replayTutorial = useCallback(() => {
    dispatchLocal({ type: 'replayTutorial', now: Date.now() });
  }, [dispatchLocal]);
  const toggleHints = useCallback(() => dispatchLocal({ type: 'toggleHints' }), [dispatchLocal]);
  const reviewVocabulary = useCallback((elementId: string, rating: 'again' | 'good' | 'easy') => {
    dispatchLocal({ type: 'review', elementId, rating, now: Date.now() });
  }, [dispatchLocal]);

  const exportSave = useCallback((): string => {
    const action: GameAction = { type: 'markDataTransferred', now: Date.now() };
    const exported = gameReducer(gameState, action);
    dispatchLocal(action);
    return serializeSave(exported);
  }, [gameState, dispatchLocal]);

  const importSave = useCallback((text: string): boolean => {
    const imported = parseSave(text);
    if (!imported) return false;
    // Badges that come with the file are not news; only ones earned by the import itself are.
    announcedBadges.current = new Set(imported.badges);
    clearTransientUi();
    dispatchLocal({ type: 'replace', state: imported, now: Date.now() });
    return true;
  }, [clearTransientUi, dispatchLocal]);

  const resetGame = useCallback(() => {
    announcedBadges.current = new Set();
    clearTransientUi();
    dispatchLocal({ type: 'reset', now: Date.now() });
  }, [clearTransientUi, dispatchLocal]);

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
    wrongGuess,
    skipWord,
    dismissSolved,
    dismissBadge,
    completeTutorial,
    dismissTutorial,
    replayTutorial,
    toggleHints,
    reviewVocabulary,
    exportSave,
    importSave,
    resetGame,
    persistenceError,
    saveConflict,
  };
}
