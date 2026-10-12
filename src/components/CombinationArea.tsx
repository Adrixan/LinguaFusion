import { useMemo } from 'react';
import { elements, Element, getElementById, getCombinableElements } from '../data/elements';
import { Notice } from '../hooks/useGame';

interface CombinationAreaProps {
  selectedElements: string[];
  notice: Notice | null;
  unlockedElements: string[];
  discoveredElements: string[];
  showHints: boolean;
  onSelectElement: (id: string) => void;
  onRemoveSelected: (slotIndex: number) => void;
  onCombine: () => void;
}

function Slot({ element, index, onRemove }: { element: Element | null; index: number; onRemove: (index: number) => void }) {
  return (
    <button
      type="button"
      className={`combination-slot ${element ? 'filled' : ''}`}
      onClick={() => onRemove(index)}
      disabled={!element}
      aria-label={element ? `${element.name} aus Slot ${index + 1} entfernen` : `Slot ${index + 1} ist leer`}
    >
      <div className="element-symbol" aria-hidden="true">{element ? element.symbol : '+'}</div>
      <div className="element-name">{element ? element.name : 'Element'}</div>
    </button>
  );
}

function CombinationArea({
  selectedElements,
  notice,
  unlockedElements,
  discoveredElements,
  showHints,
  onSelectElement,
  onRemoveSelected,
  onCombine,
}: CombinationAreaProps) {
  const unlocked = useMemo(() => {
    const ids = new Set(unlockedElements);
    return elements.filter(element => ids.has(element.id));
  }, [unlockedElements]);

  const discovered = useMemo(() => new Set(discoveredElements), [discoveredElements]);

  // Elements that can still produce something undiscovered with at least one partner.
  const generallyCombinable = useMemo(() => {
    const ids = new Set<string>();
    if (!showHints) return ids;
    for (let i = 0; i < unlocked.length; i++) {
      for (let j = i; j < unlocked.length; j++) {
        const result = getCombinableElements(unlocked[i].id, unlocked[j].id);
        if (result && !discovered.has(result.id)) {
          ids.add(unlocked[i].id);
          ids.add(unlocked[j].id);
        }
      }
    }
    return ids;
  }, [showHints, unlocked, discovered]);

  // Partners that produce something undiscovered together with the single selected element.
  const combinableWithSelected = useMemo(() => {
    const ids = new Set<string>();
    if (!showHints || selectedElements.length !== 1) return ids;
    for (const element of unlocked) {
      const result = getCombinableElements(selectedElements[0], element.id);
      if (result && !discovered.has(result.id)) ids.add(element.id);
    }
    return ids;
  }, [showHints, selectedElements, unlocked, discovered]);

  const slotElement = (index: number): Element | null => {
    const id = selectedElements[index];
    return id ? getElementById(id) ?? null : null;
  };

  const hasSingleSelection = selectedElements.length === 1;

  return (
    <div>
      <div className="combination-area">
        <Slot element={slotElement(0)} index={0} onRemove={onRemoveSelected} />
        <div className="combination-plus" aria-hidden="true">+</div>
        <Slot element={slotElement(1)} index={1} onRemove={onRemoveSelected} />
        <div className="combination-equals" aria-hidden="true">=</div>
        <div className="combination-slot" aria-hidden="true">
          <div className="element-symbol">?</div>
          <div className="element-name">Ergebnis</div>
        </div>
      </div>

      <div aria-live="polite">
        {notice && <p className={`notice notice-${notice.kind}`}>{notice.text}</p>}
      </div>

      {selectedElements.length === 2 && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" className="combine-btn" onClick={onCombine}>
            ✨ Kombiniere!
          </button>
        </div>
      )}

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Wähle Elemente:</h3>
      <div className="element-grid">
        {unlocked.map(element => {
          const isSelected = selectedElements.includes(element.id);
          const showGeneralHint = !hasSingleSelection && generallyCombinable.has(element.id);
          const showTargetHint = hasSingleSelection && combinableWithSelected.has(element.id);
          const classes = [
            'element-card',
            `element-category-${element.category}`,
            isSelected && 'selected',
            showGeneralHint && 'hint-combinable',
            showTargetHint && 'hint-glow',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={element.id}
              type="button"
              className={classes}
              aria-pressed={isSelected}
              onClick={() => onSelectElement(element.id)}
            >
              <div className="element-symbol" aria-hidden="true">{element.symbol}</div>
              <div className="element-name">{element.name}</div>
              {showGeneralHint && <div className="combinable-indicator" aria-hidden="true">✨</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CombinationArea;
