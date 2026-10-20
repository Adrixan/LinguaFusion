import { Badge } from '../data/badges';
import { elements } from '../data/elements';
import { GameState } from '../game/state';

interface BadgeDisplayProps {
  badges: Badge[];
  earnedBadges: string[];
  gameState: GameState;
}

function BadgeDisplay({ badges, earnedBadges, gameState }: BadgeDisplayProps) {
  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;
  const categoryById = new Map(elements.map(element => [element.id, element.category]));
  const discovered = gameState.discoveredElements.filter(id => categoryById.get(id) !== 'basic');

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
          const category = badge.condition.startsWith('category-') ? badge.condition.slice('category-'.length) : null;
          const current = category
            ? discovered.filter(id => categoryById.get(id) === category).length
            : badge.condition === 'discovered' ? discovered.length
              : badge.condition === 'words' ? gameState.wordsSolved
                : badge.condition === 'combinations' ? gameState.combinations
                  : badge.condition === 'streak' ? gameState.maxStreak
                    : badge.condition === 'perfect' ? gameState.perfectWords
                      : badge.condition === 'tutorial' ? Number(gameState.tutorialCompleted)
                        : badge.condition === 'export' ? Number(gameState.dataTransferred)
                          : isEarned ? badge.requirement : 0;
          const isTimeBadge = badge.condition === 'night' || badge.condition === 'morning';
          return (
            <div
              key={badge.id} 
              className={`badge ${isEarned ? '' : 'locked'}`}
            >
              <div className="badge-icon" aria-hidden="true">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <p className="badge-description">{badge.description}</p>
              <p className="badge-progress">{isEarned ? 'Verdient' : isTimeBadge ? 'Zeitabhängig' : `${Math.min(current, badge.requirement)} / ${badge.requirement}`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeDisplay;
