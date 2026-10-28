import { useMemo, useState } from 'react';
import { elements } from '../data/elements';
import { vocabularyNotes } from '../data/vocabulary';
import { GameState, getReviewSchedule } from '../game/state';
import { useNow } from '../hooks/useNow';

// Matches the play-time tick in useGame, which used to re-render this view: due words appear within 5 s.
const CLOCK_MS = 5_000;

interface VocabularyReviewProps {
  gameState: GameState;
  onReview: (elementId: string, rating: 'again' | 'good' | 'easy') => void;
}

function VocabularyReview({ gameState, onReview }: VocabularyReviewProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [now, refreshNow] = useNow(CLOCK_MS);
  const due = useMemo(() => elements.filter(element => {
    if (!gameState.unlockedElements.includes(element.id)) return false;
    const review = gameState.reviews[element.id];
    return !review || Date.parse(review.dueAt) <= now;
  }), [gameState, now]);
  const upcoming = useMemo(() => elements.filter(element => {
    const review = gameState.reviews[element.id];
    return gameState.unlockedElements.includes(element.id) && review && Date.parse(review.dueAt) > now;
  }).sort((a, b) => Date.parse(gameState.reviews[a.id].dueAt) - Date.parse(gameState.reviews[b.id].dueAt)).slice(0, 5), [gameState, now]);

  return (
    <section className="review-panel" aria-labelledby="review-heading">
      <div className="review-intro">
        <h2 id="review-heading">📚 Wortschatz wiederholen</h2>
        <p>Festige bereits gelernte Wörter mit kurzen Abrufübungen. Die nächste Wiederholung wird automatisch geplant.</p>
      </div>
      {due.length === 0 ? (
        <div className="review-empty">
          <h3>Im Moment ist nichts fällig</h3>
          <p>Komm zur nächsten Wiederholung wieder oder entdecke weitere Wörter.</p>
        </div>
      ) : (
        <div className="review-cards">
          {due.slice(0, 6).map(element => {
            const review = gameState.reviews[element.id];
            const note = vocabularyNotes[element.id];
            return (
              <article className="review-card" key={element.id}>
                <div className="review-symbol" aria-hidden="true">{revealedIds.has(element.id) ? element.symbol : '❔'}</div>
                <h3>{revealedIds.has(element.id) ? element.name : 'Welches Wort passt?'}</h3>
                <p className="review-hint">{element.hint}</p>
                {!revealedIds.has(element.id) ? <button type="button" className="submit-btn" onClick={() => { refreshNow(); setRevealedIds(previous => new Set(previous).add(element.id)); }}>Antwort anzeigen</button> : <>
                {note && <p className="review-grammar">Artikel: <strong>{note.article}</strong> {element.name} · Mehrzahl: <strong>{note.plural ?? 'keine übliche Mehrzahl in dieser Bedeutung'}</strong></p>}
                <p className="review-example">{note ? `„${note.example}“` : 'Sprich das Wort laut aus und bilde einen eigenen Satz.'}</p>
                <div className="review-actions" aria-label={`Wiederholung für ${element.name}`}>
                  {(['again', 'good', 'easy'] as const).map((rating, index) => {
                    const schedule = getReviewSchedule(review, rating, now);
                    const label = ['Nochmal', 'Gewusst', 'Leicht'][index];
                    const timing = rating === 'again' ? 'in 10 Minuten' : schedule.intervalDays === 1 ? 'morgen' : `in ${schedule.intervalDays} Tagen`;
                    return <button key={rating} type="button" onClick={() => { onReview(element.id, rating); refreshNow(); setRevealedIds(new Set()); }}>{label} <small>{timing}</small></button>;
                  })}
                </div>
                </>}
              </article>
            );
          })}
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="review-upcoming">
          <h3>Demnächst</h3>
          <ul>{upcoming.map(element => <li key={element.id}>{element.name}: {new Date(gameState.reviews[element.id].dueAt).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

export default VocabularyReview;
