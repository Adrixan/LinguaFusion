import { Badge } from '../data/badges';

interface BadgeDisplayProps {
  badges: Badge[];
  earnedBadges: string[];
}

function BadgeDisplay({ badges, earnedBadges }: BadgeDisplayProps) {
  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{earnedCount}</div>
          <div className="stat-label">Verdiente Abzeichen</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalCount - earnedCount}</div>
          <div className="stat-label">Verbleibende</div>
        </div>
      </div>

      <div className="badge-grid">
        {badges.map(badge => {
          const isEarned = earnedBadges.includes(badge.id);
          return (
            <div 
              key={badge.id} 
              className={`badge ${isEarned ? '' : 'locked'}`}
              title={badge.description}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeDisplay;
