import Modal from './Modal';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  showHints: boolean;
  onToggleHints: () => void;
}

function SettingsModal({ onClose, onExport, onImport, onReset, showHints, onToggleHints }: SettingsModalProps) {
  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal ariaLabel="Einstellungen" onClose={onClose}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>⚙️ Einstellungen</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.5rem' }}
          >
            ×
          </button>
        </div>

        <div className="settings-section">
          <h3>🎮 Spieloptionen</h3>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', cursor: 'pointer' }}>
            <span>💡 Hinweise anzeigen</span>
            <input
              type="checkbox"
              checked={showHints}
              onChange={onToggleHints}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
          </label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Zeige kombinierbare Elemente
          </p>
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
            LinguaFusion v{__APP_VERSION__}<br/>
            Ein Element-Kombinationsspiel<br/>
            Made with ❤️
          </p>
        </div>
    </Modal>
  );
}

export default SettingsModal;
