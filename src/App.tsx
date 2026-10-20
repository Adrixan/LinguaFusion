import { ChangeEvent, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useGame } from './hooks/useGame';
import { elements } from './data/elements';
import { badges } from './data/badges';
import { MAX_IMPORT_BYTES } from './game/save';

import CombinationArea from './components/CombinationArea';
import WordPuzzle from './components/WordPuzzle';
import BadgeDisplay from './components/BadgeDisplay';
import TutorialOverlay from './components/TutorialOverlay';
import BadgeModal from './components/BadgeModal';
import Modal from './components/Modal';
import SettingsModal from './components/SettingsModal';
import StatsDisplay from './components/StatsDisplay';
import Header from './components/Header';
import './index.css';

// react-flow and dagre are only needed for the Sammlung tab.
const CollectionGraph = lazy(() => import('./components/CollectionGraph'));

type Tab = 'combine' | 'collection' | 'badges' | 'stats';

const TABS: { id: Tab; label: (unlocked: number, earned: number) => string }[] = [
  { id: 'combine', label: () => '⚗️ Kombination' },
  { id: 'collection', label: unlocked => `📦 Sammlung (${unlocked}/${elements.length})` },
  { id: 'badges', label: (_, earned) => `🏅 Abzeichen (${earned}/${badges.length})` },
  { id: 'stats', label: () => '📊 Statistiken' },
];

const TOAST_MS = 4000;

function App() {
  const game = useGame();
  const { gameState, pendingElement, lastSolved, activeBadge } = game;

  const [activeTab, setActiveTab] = useState<Tab>('combine');
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(
    game.loadStatus === 'recovered'
      ? 'Dein gespeicherter Spielstand war beschädigt. Er wurde gesichert und ein neues Spiel gestartet.'
      : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const progress = Math.floor((gameState.unlockedElements.length / elements.length) * 100);

  const handleExport = () => {
    const blob = new Blob([game.exportSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguafusion-save-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setToast('Die Datei ist zu groß für einen Spielstand.');
      return;
    }
    if (!confirm('Der aktuelle Spielstand wird durch die Datei ersetzt. Fortfahren?')) return;
    try {
      const imported = game.importSave(await file.text());
      setToast(imported ? 'Spielstand erfolgreich importiert!' : 'Die Datei ist kein gültiger Spielstand.');
    } catch {
      setToast('Die Datei konnte nicht gelesen werden. Bitte erneut versuchen.');
    }
  };

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alles zurücksetzen? Dein gesamter Fortschritt geht verloren!')) {
      game.resetGame();
      setShowSettings(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        progress={progress}
        onSettingsClick={() => setShowSettings(true)}
        onExportClick={handleExport}
        onImportClick={handleImportClick}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        hidden
        aria-hidden="true"
      />

      {!gameState.tutorialDismissed && (
        <TutorialOverlay onComplete={game.completeTutorial} onDismiss={game.dismissTutorial} />
      )}

      {game.persistenceError && (
        <div className="persistence-warning" role="alert">
          Spielstand konnte nicht gespeichert werden. Exportiere deinen Fortschritt, bevor du die Seite verlässt.
          <button type="button" onClick={handleExport}>Jetzt exportieren</button>
        </div>
      )}
      {game.saveConflict && (
        <div className="persistence-warning" role="alert">
          Ein anderer Tab hat neueren Fortschritt gespeichert. Dessen Spielstand wurde übernommen. Spiele bitte nur in einem Tab gleichzeitig.
        </div>
      )}

      <main className="main-content">
        <div className="tabs" role="tablist" aria-label="Spielbereiche" onKeyDown={event => {
          const tabIds: Tab[] = ['combine', 'collection', 'badges', 'stats'];
          const current = tabIds.indexOf(activeTab);
          const next = event.key === 'ArrowRight' ? (current + 1) % tabIds.length
            : event.key === 'ArrowLeft' ? (current - 1 + tabIds.length) % tabIds.length : -1;
          if (next >= 0) {
            event.preventDefault();
            setActiveTab(tabIds[next]);
            document.getElementById(`tab-${tabIds[next]}`)?.focus();
          }
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              aria-controls="game-panel"
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label(gameState.unlockedElements.length, gameState.badges.length)}
            </button>
          ))}
        </div>

        <div role="tabpanel" id="game-panel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
          {activeTab === 'combine' &&
            (pendingElement ? (
              <WordPuzzle
                key={pendingElement.id}
                element={pendingElement}
                onSolve={game.solveWord}
                onSkip={game.skipWord}
                wrongAttempts={gameState.puzzleAttempts[pendingElement.id] ?? 0}
                onWrongGuess={game.wrongGuess}
              />
            ) : (
              <CombinationArea
                selectedElements={game.selectedElements}
                notice={game.notice}
                unlockedElements={gameState.unlockedElements}
                discoveredElements={gameState.discoveredElements}
                showHints={gameState.showHints}
                onSelectElement={game.selectElement}
                onRemoveSelected={game.removeSelected}
                onCombine={game.combine}
              />
            ))}

          {activeTab === 'collection' && (
            <Suspense fallback={<p role="status">Sammlung wird geladen…</p>}>
              <CollectionGraph unlockedElements={gameState.unlockedElements} />
            </Suspense>
          )}

          {activeTab === 'badges' && <BadgeDisplay badges={badges} earnedBadges={gameState.badges} gameState={gameState} />}

          {activeTab === 'stats' && (
            <StatsDisplay gameState={gameState} totalElements={elements.length} onReset={handleReset} />
          )}
        </div>
      </main>

      {showSettings && gameState.tutorialDismissed && !lastSolved && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onExport={handleExport}
          onImport={handleImportClick}
          onReset={handleReset}
          showHints={gameState.showHints}
          onToggleHints={game.toggleHints}
          onReplayTutorial={game.replayTutorial}
        />
      )}

      {lastSolved && gameState.tutorialDismissed && (
        <Modal ariaLabel="Richtig" onClose={game.dismissSolved} className="celebration-content">
          <div className="celebration-icon" aria-hidden="true">{lastSolved.symbol}</div>
          <h2>🎉 Richtig!</h2>
          <p>Das Element ist: <strong>{lastSolved.name}</strong></p>
          <p style={{ color: 'var(--success)', marginTop: '1rem' }}>Neues Element freigeschaltet!</p>
          <button className="combine-btn" onClick={game.dismissSolved}>Weiter</button>
        </Modal>
      )}

      {activeBadge && !lastSolved && !pendingElement && !showSettings && gameState.tutorialDismissed && (
        <BadgeModal badge={activeBadge} onClose={game.dismissBadge} />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
