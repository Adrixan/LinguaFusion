import { GameState } from '../hooks/useGame';

interface StatsDisplayProps {
  gameState: GameState;
  totalElements: number;
  onReset: () => void;
}

function StatsDisplay({ gameState, totalElements, onReset }: StatsDisplayProps) {
  const playTimeMinutes = Math.floor(gameState.totalPlayTime / 60000);
  const playTimeHours = Math.floor(playTimeMinutes / 60);
  const remainingMinutes = playTimeMinutes % 60;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-AT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{gameState.discoveredElements.length}</div>
          <div className="stat-label">Entdeckte Elemente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.unlockedElements.length}</div>
          <div className="stat-label">Freigeschaltete Elemente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.combinations}</div>
          <div className="stat-label">Kombinationen</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.wordsSolved}</div>
          <div className="stat-label">Gelöste Rätsel</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.badges.length}</div>
          <div className="stat-label">Abzeichen</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.maxStreak}</div>
          <div className="stat-label">Beste Serie</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>📊 Detaillierte Statistiken</h3>
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Fortschritt:</span>
            <span style={{ color: 'var(--accent)' }}>
              {Math.round((gameState.discoveredElements.length / totalElements) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(gameState.discoveredElements.length / totalElements) * 100}%` }}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Hinweise verwendet:</span>
          </div>
          <div style={{ textAlign: 'right' }}>{gameState.hintsUsed}</div>
          
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Perfekte Rätsel:</span>
          </div>
          <div style={{ textAlign: 'right' }}>{gameState.perfectWords}</div>
          
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Spielzeit:</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            {playTimeHours > 0 ? `${playTimeHours}h ${remainingMinutes}m` : `${remainingMinutes} min`}
          </div>
          
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Zuletzt gespielt:</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            {formatDate(gameState.lastPlayed)}
          </div>
        </div>
      </div>

      <button 
        onClick={onReset}
        style={{ 
          width: '100%', 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--error)', 
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        🗑️ Spiel zurücksetzen
      </button>
    </div>
  );
}

export default StatsDisplay;
