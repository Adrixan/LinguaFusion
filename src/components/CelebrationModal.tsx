import { useEffect } from 'react';
import { Element } from '../data/elements';
import { Badge } from '../data/badges';

interface CelebrationModalProps {
  element: Element | null;
  onClose: () => void;
  isWordComplete?: boolean;
  badge?: Badge;
}

function CelebrationModal({ element, onClose, isWordComplete, badge }: CelebrationModalProps) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal celebration-content" onClick={e => e.stopPropagation()}>
        {badge ? (
          <>
            <div className="celebration-icon">{badge.icon}</div>
            <h2>🎊 Neues Abzeichen!</h2>
            <p><strong>{badge.name}</strong></p>
            <p>{badge.description}</p>
          </>
        ) : isWordComplete ? (
          <>
            <div className="celebration-icon">🎉</div>
            <h2>Rätsel gelöst!</h2>
            <p>Großartig gemacht!</p>
          </>
        ) : element ? (
          <>
            <div className="celebration-icon">{element.symbol}</div>
            <h2>✨ Neues Element!</h2>
            <p><strong>{element.name}</strong></p>
            <p style={{ color: 'var(--text-muted)' }}>{element.hint}</p>
          </>
        ) : null}

        <button 
          className="combine-btn"
          onClick={onClose}
          style={{ marginTop: '1.5rem' }}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}

export default CelebrationModal;
