import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { elements } from './data/elements';
import { badges } from './data/badges';

import CollectionGraph from './components/CollectionGraph';
import CombinationArea from './components/CombinationArea';
import BadgeDisplay from './components/BadgeDisplay';
import TutorialOverlay from './components/TutorialOverlay';
import CelebrationModal from './components/CelebrationModal';
import SettingsModal from './components/SettingsModal';
import StatsDisplay from './components/StatsDisplay';
import Header from './components/Header';
import './index.css';

type Tab = 'combine' | 'collection' | 'badges' | 'stats';

function App() {
  const {
    gameState,
    selectedElements,
    combinationResult,
    setCombinationResult,
    pendingDiscovery,
    showCelebration,
    newBadge,
    setShowCelebration,
    setNewBadge,
    combine,
    selectElement,
    skipWord,
    clearSelection,
    clearPendingDiscovery,
    completeTutorial,
    exportSave,
    importSave,
    resetGame,
    solveWord,
    useHint,
    toggleHints
  } = useGame();

  const [activeTab, setActiveTab] = useState<Tab>('combine');
  const [showSettings, setShowSettings] = useState(false);

  const unlockedElements = elements.filter(e => gameState.unlockedElements.includes(e.id));

  const progress = Math.round((gameState.discoveredElements.length / elements.length) * 100);

  const handleCombine = () => {
    if (selectedElements.length === 2) {
      const result = combine(selectedElements[0], selectedElements[1]);
      if (result === null) {
        setCombinationResult(null);
      }
    }
  };

  const handleExport = () => {
    const data = exportSave();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alchemie-save-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importSave(text);
        if (success) {
          alert('Spielstand erfolgreich importiert!');
        } else {
          alert('Fehler beim Importieren!');
        }
      }
    };
    input.click();
  };

  return (
    <div className="app-container">
      <Header 
        progress={progress}
        onSettingsClick={() => setShowSettings(true)}
        onExportClick={handleExport}
        onImportClick={handleImport}
      />

      {!gameState.tutorialCompleted && (
        <TutorialOverlay onComplete={completeTutorial} />
      )}

      <main className="main-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'combine' ? 'active' : ''}`}
            onClick={() => setActiveTab('combine')}
          >
            ⚗️ Kombination
          </button>
          <button 
            className={`tab ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            📦 Sammlung ({gameState.discoveredElements.length}/{elements.length})
          </button>
          <button 
            className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            🏅 Abzeichen ({gameState.badges.length}/{badges.length})
          </button>
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiken
          </button>
        </div>

        {activeTab === 'combine' && (
          <div>
            <CombinationArea
              selectedElements={selectedElements}
              combinationResult={combinationResult}
              pendingDiscovery={pendingDiscovery}
              unlockedElements={unlockedElements}
              discoveredElements={gameState.discoveredElements}
              showHints={gameState.showHints}
              onSelectElement={selectElement}
              onCombine={handleCombine}
              onClear={clearSelection}
              onComplete={setCombinationResult}
              onClearPendingDiscovery={clearPendingDiscovery}
              onSkipWord={skipWord}
              solveWord={solveWord}
              useHint={useHint}
            />
          </div>
        )}

        {activeTab === 'collection' && (
          <CollectionGraph
            elements={elements}
            unlockedElements={gameState.unlockedElements}
            discoveredElements={gameState.discoveredElements}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeDisplay 
            badges={badges} 
            earnedBadges={gameState.badges} 
          />
        )}

        {activeTab === 'stats' && (
          <StatsDisplay 
            gameState={gameState} 
            totalElements={elements.length}
            onReset={resetGame}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          onExport={handleExport}
          onImport={handleImport}
          onReset={resetGame}
          showHints={gameState.showHints}
          onToggleHints={toggleHints}
        />
      )}

      {showCelebration && combinationResult && (
        <CelebrationModal
          element={combinationResult}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {showCelebration && !combinationResult && (
        <CelebrationModal
          element={null}
          onClose={() => setShowCelebration(false)}
          isWordComplete={true}
        />
      )}

      {newBadge && (
        <CelebrationModal
          element={null}
          onClose={() => setNewBadge(null)}
          badge={newBadge}
        />
      )}
    </div>
  );
}

export default App;
