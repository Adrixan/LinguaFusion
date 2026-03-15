interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

function SettingsModal({ onClose, onExport, onImport, onReset }: SettingsModalProps) {
  const handleReset = () => {
    if (confirm('Möchtest du wirklich alles zurücksetzen? Dein gesamter Fortschritt geht verloren!')) {
      onReset();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>⚙️ Einstellungen</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.5rem' }}
          >
            ×
          </button>
        </div>

        <div className="settings-section">
          <h3>📁 Spielstand</h3>
          <button className="settings-btn" onClick={onExport}>
            💾 Exportieren
          </button>
          <button className="settings-btn" onClick={onImport}>
            📂 Importieren
          </button>
        </div>

        <div className="settings-section">
          <h3>🔄 Zurücksetzen</h3>
          <button 
            className="settings-btn" 
            onClick={handleReset}
            style={{ background: 'var(--error)', color: 'white' }}
          >
            🗑️ Alles zurücksetzen
          </button>
        </div>

        <div className="settings-section">
          <h3>ℹ️ Über das Spiel</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Alchemie Fusion v1.0.0<br/>
            Ein Element-Kombinationsspiel<br/>
            Made with ❤️
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
