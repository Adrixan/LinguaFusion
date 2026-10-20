interface HeaderProps {
  progress: number;
  onSettingsClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

function Header({ progress, onSettingsClick, onExportClick, onImportClick }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <h1>🔤 LinguaFusion</h1>
        <div className="progress-bar" style={{ width: '200px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {progress}% entdeckt
        </span>
      </div>
      
      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={onExportClick}
          title="Exportieren"
          aria-label="Spielstand exportieren"
        >
          💾
        </button>
        <button 
          className="icon-btn" 
          onClick={onImportClick}
          title="Importieren"
          aria-label="Spielstand importieren"
        >
          📂
        </button>
        <button 
          className="icon-btn" 
          onClick={onSettingsClick}
          title="Einstellungen"
          aria-label="Einstellungen öffnen"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}

export default Header;
