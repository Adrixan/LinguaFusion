import { useState, useEffect, useCallback, useRef } from 'react';
import { elements, getCombinableElements, Element, ElementCategory } from '../data/elements';
import { badges, Badge } from '../data/badges';

export interface GameState {
  unlockedElements: string[];
  discoveredElements: string[];
  combinations: number;
  wordsSolved: number;
  hintsUsed: number;
  perfectWords: number;
  streak: number;
  maxStreak: number;
  tutorialCompleted: boolean;
  badges: string[];
  lastPlayed: string;
  totalPlayTime: number;
  lastSessionTime: number;
  showHints: boolean;
}

const INITIAL_STATE: GameState = {
  unlockedElements: ['feuer', 'wasser', 'erde', 'luft'],
  discoveredElements: ['feuer', 'wasser', 'erde', 'luft'],
  combinations: 0,
  wordsSolved: 0,
  hintsUsed: 0,
  perfectWords: 0,
  streak: 0,
  maxStreak: 0,
  tutorialCompleted: false,
  badges: [],
  lastPlayed: new Date().toISOString(),
  totalPlayTime: 0,
  lastSessionTime: Date.now(),
  showHints: true
};

const STORAGE_KEY = 'alchemie-fusion-save';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed, lastSessionTime: Date.now() };
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return INITIAL_STATE;
  });

  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [combinationResult, setCombinationResult] = useState<Element | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [pendingDiscovery, setPendingDiscovery] = useState<Element | null>(null);
  const wasAlreadyDiscovered = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const playTime = Date.now() - gameState.lastSessionTime;
        const newState = {
          ...gameState,
          totalPlayTime: gameState.totalPlayTime + playTime,
          lastSessionTime: Date.now(),
          lastPlayed: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  const checkBadges = useCallback((state: GameState): { newBadges: string[], newBadge?: Badge } => {
    const newBadges: string[] = [];
    let newBadge: Badge | undefined;

    const discovered = state.discoveredElements.length;
    const categoryCounts: Record<ElementCategory, number> = {
      nature: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'nature').length,
      animal: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'animal').length,
      plant: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'plant').length,
      food: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'food').length,
      object: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'object').length,
      concept: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'concept').length,
      basic: elements.filter(e => state.discoveredElements.includes(e.id) && e.category === 'basic').length
    };

    for (const badge of badges) {
      if (state.badges.includes(badge.id)) continue;

      let earned = false;
      switch (badge.condition) {
        case 'discovered':
          earned = discovered >= badge.requirement;
          break;
        case 'tutorial':
          earned = state.tutorialCompleted;
          break;
        case 'export':
          earned = false;
          break;
        case 'night': {
          const hour = new Date().getHours();
          earned = hour >= 0 && hour < 5;
          break;
        }
        case 'morning': {
          const morningHour = new Date().getHours();
          earned = morningHour >= 5 && morningHour < 6;
          break;
        }
        case 'speed':
          earned = false;
          break;
        default:
          if (badge.condition.startsWith('category-')) {
            const category = badge.condition.replace('category-', '') as ElementCategory;
            earned = categoryCounts[category] >= badge.requirement;
          }
      }

      if (earned) {
        newBadges.push(badge.id);
        if (!newBadge) newBadge = badge;
      }
    }

    return { newBadges, newBadge };
  }, []);

  const combine = useCallback((element1Id: string, element2Id: string): Element | null => {
    const result = getCombinableElements(element1Id, element2Id);
    if (!result) {
      setGameState(prev => ({
        ...prev,
        streak: 0
      }));
      return null;
    }

    wasAlreadyDiscovered.current = false;
    const resultId = result.id;

    setGameState(prev => {
      const isNewDiscovery = !prev.discoveredElements.includes(resultId);
      
      if (!isNewDiscovery) {
        wasAlreadyDiscovered.current = true;
        return {
          ...prev,
          streak: 0
        };
      }
      
      const newStreak = prev.streak + 1;
      const newMaxStreak = Math.max(newStreak, prev.maxStreak);

      const newState: GameState = {
        ...prev,
        combinations: prev.combinations + 1,
        streak: newStreak,
        maxStreak: newMaxStreak
      };

      newState.discoveredElements = [...prev.discoveredElements, resultId];

      return newState;
    });

    if (wasAlreadyDiscovered.current) {
      setPendingDiscovery(null);
      setSelectedElements([]);
      return null;
    }

    setPendingDiscovery(result);
    setCombinationResult(null);
    setSelectedElements([]);

    return result;
  }, []);

  const selectElement = useCallback((elementId: string) => {
    setSelectedElements(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId);
      }
      if (prev.length >= 2) {
        return [prev[1], elementId];
      }
      return [...prev, elementId];
    });
    setCombinationResult(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
    setCombinationResult(null);
  }, []);

  const solveWord = useCallback((elementId: string, usedHint: boolean) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return;
    
    setGameState(prev => {
      const isAlreadyUnlocked = prev.unlockedElements.includes(element.id);
      const newUnlocked = !isAlreadyUnlocked
        ? [...prev.unlockedElements, element.id]
        : prev.unlockedElements;
      
      const newState: GameState = {
        ...prev,
        unlockedElements: newUnlocked,
        wordsSolved: prev.wordsSolved + 1,
        hintsUsed: usedHint ? prev.hintsUsed + 1 : prev.hintsUsed,
        perfectWords: usedHint ? prev.perfectWords : prev.perfectWords + 1
      };
      
      // Check for new badges
      if (newUnlocked.length > prev.unlockedElements.length) {
        const { newBadges, newBadge: earnedBadge } = checkBadges(newState);
        if (newBadges.length > 0) {
          newState.badges = [...newState.badges, ...newBadges];
          if (earnedBadge) {
            setTimeout(() => setNewBadge(earnedBadge), 1000);
          }
        }
      }

      return newState;
    });

  }, [checkBadges]);

  const skipWord = useCallback(() => {
    const pendingElement = pendingDiscovery;
    if (!pendingElement) return null;

    // Remove from discoveredElements so the player can re-combine to try the puzzle again
    setGameState(prev => ({
      ...prev,
      discoveredElements: prev.discoveredElements.filter(id => id !== pendingElement.id),
    }));
    setPendingDiscovery(null);

    return pendingElement;
  }, [pendingDiscovery]);

  const useHint = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  }, []);

  const completeTutorial = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, tutorialCompleted: true };
      const { newBadges, newBadge } = checkBadges(newState);
      if (newBadges.length > 0) {
        newState.badges = [...newState.badges, ...newBadges];
        if (newBadge) {
          setTimeout(() => setNewBadge(newBadge), 500);
        }
      }
      return newState;
    });
  }, [checkBadges]);

  const exportSave = useCallback((): string => {
    const { ...exportState } = gameState;
    return JSON.stringify(exportState, null, 2);
  }, [gameState]);

  const importSave = useCallback((data: string): boolean => {
    try {
      const imported = JSON.parse(data);
      const newState = {
        ...INITIAL_STATE,
        ...imported,
        lastSessionTime: Date.now()
      };
      setGameState(newState);
      
      const { newBadges, newBadge } = checkBadges(newState);
      if (newBadges.length > 0) {
        setTimeout(() => setNewBadge(badges.find(b => b.id === newBadges[0])!), 500);
      } else if (newBadge) {
        setNewBadge(newBadge);
      }
      
      const { newBadges: exportBadges } = checkBadges({ ...newState, badges: [...newState.badges, 'export-import'] });
      if (exportBadges.includes('export-import')) {
        setGameState(prev => ({ ...prev, badges: [...prev.badges, 'export-import'] }));
      }
      
      return true;
    } catch (e) {
      console.error('Failed to import save:', e);
      return false;
    }
  }, [checkBadges]);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    setSelectedElements([]);
    setCombinationResult(null);
    setShowCelebration(false);
    setNewBadge(null);
    setPendingDiscovery(null);
  }, []);

  const clearPendingDiscovery = useCallback(() => {
    setPendingDiscovery(null);
  }, []);

  const toggleHints = useCallback(() => {
    setGameState(prev => ({ ...prev, showHints: !prev.showHints }));
  }, []);

  return {
    gameState,
    selectedElements,
    combinationResult,
    setCombinationResult,
    pendingDiscovery,
    showCelebration,
    newBadge,
    setShowCelebration,
    setNewBadge,
    combine,
    selectElement,
    clearSelection,
    solveWord,
    skipWord,
    clearPendingDiscovery,
    useHint,
    completeTutorial,
    exportSave,
    importSave,
    resetGame,
    checkBadges,
    toggleHints
  };
}
