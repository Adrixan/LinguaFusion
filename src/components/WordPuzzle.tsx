import { FormEvent, useId, useRef, useState } from 'react';
import { Element } from '../data/elements';
import { isCorrectGuess, normalizeWord } from '../game/words';

interface WordPuzzleProps {
  element: Element;
  /** Called with the number of wrong guesses made before the correct one. */
  onSolve: (wrongAttempts: number) => void;
  onSkip: () => void;
  wrongAttempts: number;
  onWrongGuess: () => void;
}

function WordPuzzle({ element, onSolve, onSkip, wrongAttempts, onWrongGuess }: WordPuzzleProps) {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const letterCount = [...element.name].length;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (guess.trim() === '') return;
    if (isCorrectGuess(guess, element.name)) {
      onSolve(wrongAttempts);
    } else {
      onWrongGuess();
      setGuess('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="pending-discovery">
      <h2>✨ Neue Entdeckung!</h2>
      <div className="element-symbol" style={{ fontSize: '4rem', margin: '1rem 0' }} aria-hidden="true">
        {element.symbol}
      </div>
      <p>Wie heißt dieses Element? Errate den Namen!</p>

      <div style={{ padding: '1rem' }}>
        <div className="letter-boxes" aria-hidden="true">
          {Array.from({ length: letterCount }, (_, index) => (
            <div key={index} className="letter-box">_</div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {letterCount} Buchstaben
        </p>

        <div className="hint-text" id={`${inputId}-hint`}>
          <p>💡 Hinweis: {element.hint}</p>
        </div>

        <form className="guess-input" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="sr-only">Name des Elements</label>
          <input
            id={inputId}
            ref={inputRef}
            aria-describedby={`${inputId}-hint${wrongAttempts > 0 ? ` ${inputId}-error` : ''}`}
            type="text"
            value={guess}
            onChange={event => setGuess(event.target.value)}
            placeholder="Dein Tipp..."
            maxLength={normalizeWord(element.name).length}
            lang="de"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            style={{ textTransform: 'uppercase' }}
            autoFocus
          />
          <button type="submit" className="submit-btn">Prüfen</button>
        </form>

        {wrongAttempts > 0 && (
          <p id={`${inputId}-error`} role="alert" style={{ textAlign: 'center', color: 'var(--error)', marginBottom: '1rem' }}>
            Leider falsch! Versuche es nochmal.
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button type="button" className="submit-btn secondary" onClick={onSkip}>
            Überspringen
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Fehlversuche: {wrongAttempts}
        </p>
      </div>
    </div>
  );
}

export default WordPuzzle;
