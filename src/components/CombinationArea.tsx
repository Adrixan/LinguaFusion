import { useState, useMemo } from 'react';
import { Element, getElementById, getCombinableElements } from '../data/elements';
import WordPuzzle from './WordPuzzle';

interface CombinationAreaProps {
  selectedElements: string[];
  combinationResult: Element | null;
  pendingDiscovery: Element | null;
  unlockedElements: Element[];
  discoveredElements: string[];
  showHints: boolean;
  onSelectElement: (id: string) => void;
  onCombine: () => void;
  onClear: () => void;
  onComplete: (element: Element) => void;
  onClearPendingDiscovery: () => void;
  onSkipWord: () => Element | null;
  solveWord: (elementId: string, usedHint: boolean) => void;
  useHint: () => void;
}

function CombinationArea({
  selectedElements,
  combinationResult,
  pendingDiscovery,
  unlockedElements,
  discoveredElements,
  showHints,
  onSelectElement,
  onCombine,
  onClear,
  onComplete,
  onClearPendingDiscovery,
  onSkipWord,
  solveWord,
  useHint
}: CombinationAreaProps) {
  const [showWordPuzzle, setShowWordPuzzle] = useState(false);

  // Elements that can combine with ANY other element to produce something undiscovered
  const generallyCombinable = useMemo(() => {
    const combinableIds = new Set<string>();
    
    for (let i = 0; i < unlockedElements.length; i++) {
      for (let j = i; j < unlockedElements.length; j++) {
        const element1 = unlockedElements[i];
        const element2 = unlockedElements[j];
        
        const result = getCombinableElements(element1.id, element2.id);
        
        if (result && !discoveredElements.includes(result.id)) {
          combinableIds.add(element1.id);
          combinableIds.add(element2.id);
        }
      }
    }
    
    return combinableIds;
  }, [unlockedElements, discoveredElements]);

  // Elements that combine with the currently selected element to produce something new
  const combinableWithSelected = useMemo(() => {
    if (selectedElements.length !== 1) return new Set<string>();
    const selectedId = selectedElements[0];
    const ids = new Set<string>();
    const unlockedIds = new Set(unlockedElements.map(e => e.id));

    for (const element of unlockedElements) {
      const result = getCombinableElements(selectedId, element.id);
      if (result && !discoveredElements.includes(result.id) && !unlockedIds.has(result.id)) {
        ids.add(element.id);
      }
    }

    return ids;
  }, [selectedElements, unlockedElements, discoveredElements]);

  const getSelectedElement = (index: number): Element | null => {
    const id = selectedElements[index];
    const element = id ? getElementById(id) : undefined;
    return element ?? null;
  };

  const element1 = getSelectedElement(0);
  const element2 = getSelectedElement(1);

  const handleSlotClick = (index: number) => {
    if (selectedElements[index]) {
      onSelectElement(selectedElements[index]);
    }
  };

  // Show word puzzle when there's a pending discovery
  const [solvedElement, setSolvedElement] = useState<Element | null>(null);
  
  if (pendingDiscovery) {
    return (
      <div className="pending-discovery">
        <h2>✨ Neue Entdeckung!</h2>
        <div className="element-symbol" style={{ fontSize: '4rem', margin: '1rem 0' }}>
          {pendingDiscovery.symbol}
        </div>
        <p>Wie heißt dieses Element? Errate den Namen!</p>
        <WordPuzzle
          key={pendingDiscovery.id}
          element={pendingDiscovery}
          solveWord={solveWord}
          useHint={useHint}
          onComplete={(el) => {
            setSolvedElement(el);
            onComplete(el);
            onClearPendingDiscovery();
          }}
          onSkip={() => {
            const skipped = onSkipWord();
            if (skipped) {
              setSolvedElement(skipped);
              onComplete(skipped);
            }
            onClearPendingDiscovery();
          }}
        />
      </div>
    );
  }
  
  // Legacy: Show solved element if we just solved one (should not happen after fix)
  if (solvedElement && !combinationResult) {
    setSolvedElement(null);
  }
  
  if (showWordPuzzle && combinationResult) {
    return (
      <WordPuzzle
        element={combinationResult}
        solveWord={solveWord}
        useHint={useHint}
        onComplete={() => setShowWordPuzzle(false)}
        onSkip={() => setShowWordPuzzle(false)}
      />
    );
  }

  const hasSelection = selectedElements.length === 1;

  return (
    <div>
      <div className="combination-area">
        <div 
          className={`combination-slot ${element1 ? 'filled' : ''}`}
          onClick={() => handleSlotClick(0)}
        >
          {element1 ? (
            <>
              <div className="element-symbol">{element1.symbol}</div>
              <div className="element-name">{element1.name}</div>
            </>
          ) : (
            <>
              <div className="element-symbol">+</div>
              <div className="element-name">Element</div>
            </>
          )}
        </div>

        <div className="combination-plus">+</div>

        <div 
          className={`combination-slot ${element2 ? 'filled' : ''}`}
          onClick={() => handleSlotClick(1)}
        >
          {element2 ? (
            <>
              <div className="element-symbol">{element2.symbol}</div>
              <div className="element-name">{element2.name}</div>
            </>
          ) : (
            <>
              <div className="element-symbol">+</div>
              <div className="element-name">Element</div>
            </>
          )}
        </div>

        <div className="combination-equals">=</div>

        <div className="combination-slot">
          {combinationResult ? (
            <>
              <div className="element-symbol">{combinationResult.symbol}</div>
              <div className="element-name">{combinationResult.name}</div>
            </>
          ) : (
            <>
              <div className="element-symbol">?</div>
              <div className="element-name">Ergebnis</div>
            </>
          )}
        </div>
      </div>

      {selectedElements.length === 2 && !combinationResult && (
        <div style={{ textAlign: 'center' }}>
          <button 
            className="combine-btn"
            onClick={onCombine}
          >
            ✨ Kombiniere!
          </button>
        </div>
      )}

      {combinationResult && (
        <div className="result-display">
          <div className="result-symbol">{combinationResult.symbol}</div>
          <div className="result-name">{combinationResult.name}</div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {combinationResult.hint}
          </p>
          <button 
            className="combine-btn"
            onClick={() => setShowWordPuzzle(true)}
            style={{ marginTop: '1rem' }}
          >
            📝 Buchstabenrätsel
          </button>
          <button 
            className="combine-btn"
            onClick={onClear}
            style={{ marginTop: '0.5rem', background: 'var(--surface)', color: 'var(--text)' }}
          >
            Neue Kombination
          </button>
        </div>
      )}

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Wähle Elemente:</h3>
      <div className="element-grid">
        {unlockedElements.map(element => {
          const isGenerallyCombinable = showHints && generallyCombinable.has(element.id);
          const isTargetCombinable = showHints && hasSelection && combinableWithSelected.has(element.id);
          return (
          <div
            key={element.id}
            className={`element-card element-category-${element.category} ${
              selectedElements.includes(element.id) ? 'selected' : ''
            } ${isGenerallyCombinable && !hasSelection ? 'hint-combinable' : ''} ${isTargetCombinable ? 'hint-glow' : ''}`}
            onClick={() => onSelectElement(element.id)}
          >
            <div className="element-symbol">{element.symbol}</div>
            <div className="element-name">{element.name}</div>
            {isGenerallyCombinable && !hasSelection && (
              <div className="combinable-indicator">✨</div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default CombinationArea;
