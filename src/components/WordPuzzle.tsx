import { useState, useEffect } from 'react';
import { Element } from '../data/elements';

interface WordPuzzleProps {
  element: Element;
  onComplete: (element: Element) => void;
  onSkip: () => void;
  solveWord: (elementId: string, usedHint: boolean) => void;
  useHint: () => void;
}

function WordPuzzle({ element, onComplete, onSkip, solveWord, useHint }: WordPuzzleProps) {
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const word = element.name.toUpperCase();
  const letters = word.split('');

  useEffect(() => {
    if (showHint) {
      setUsedHint(true);
      useHint();
    }
  }, [showHint, useHint]);

  const handleGuess = () => {
    setAttempts(prev => prev + 1);
    const upperGuess = guess.toUpperCase().trim();
    
    if (upperGuess === word) {
      setIsCorrect(true);
      solveWord(element.id, usedHint);
    } else {
      if (attempts >= 1 && !showHint) {
        setShowHint(true);
      }
      setGuess('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  if (isCorrect) {
    return (
      <div className="modal-overlay">
        <div className="modal celebration-content">
          <div className="celebration-icon">🎉</div>
          <h2>Richtig!</h2>
          <p>Das Element ist: <strong>{element.name}</strong></p>
          <p style={{ color: 'var(--success)', marginTop: '1rem' }}>
            +1 neues Element freigeschaltet!
          </p>
          <button className="combine-btn" onClick={() => onComplete(element)} autoFocus>
            Weiter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Wie heißt das Element?</h2>
      
      <div className="letter-boxes">
        {letters.map((_, index) => (
          <div 
            key={index} 
            className={`letter-box ${showHint ? 'revealed' : ''}`}
          >
            {'_'}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Tipp: {element.symbol} - {letters.length} Buchstaben
      </p>

      <div className="guess-input">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Dein Tipp..."
          maxLength={letters.length}
          autoFocus
        />
        <button className="submit-btn" onClick={handleGuess}>
          Prüfen
        </button>
      </div>

      {attempts > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--error)', marginBottom: '1rem' }}>
          Leider falsch! Versuche es nochmal.
        </p>
      )}

      {showHint && (
        <div className="hint-text">
          <p>💡 Hinweis: {element.hint}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
        {!showHint && attempts >= 1 && (
          <button 
            className="submit-btn"
            onClick={() => setShowHint(true)}
            style={{ background: 'var(--warning)', color: 'var(--background)' }}
          >
            💡 Hinweis verwenden
          </button>
        )}
        <button 
          className="submit-btn"
          onClick={onSkip}
          style={{ background: 'var(--surface)' }}
        >
          Überspringen
        </button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
        Versuche: {attempts}/2
      </p>
    </div>
  );
}

export default WordPuzzle;
