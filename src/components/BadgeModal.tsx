import { Badge } from '../data/badges';
import Modal from './Modal';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
}

function BadgeModal({ badge, onClose }: BadgeModalProps) {
  return (
    <Modal ariaLabel="Neues Abzeichen" onClose={onClose} className="celebration-content">
      <div className="celebration-icon" aria-hidden="true">{badge.icon}</div>
      <h2>🎊 Neues Abzeichen!</h2>
      <p><strong>{badge.name}</strong></p>
      <p>{badge.description}</p>
      <button className="combine-btn" onClick={onClose} style={{ marginTop: '1.5rem' }}>
        Weiter
      </button>
    </Modal>
  );
}

export default BadgeModal;
