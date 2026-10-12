import { Component, ErrorInfo, ReactNode } from 'react';
import { clearSave } from '../game/save';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/** Last line of defence: a render error must never leave the player with a blank page. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private reset = () => {
    if (confirm('Den gespeicherten Spielstand löschen und neu starten?')) {
      clearSave();
      location.reload();
    }
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <h1>Hoppla, da ist etwas schiefgelaufen</h1>
        <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
          Die Anzeige ist abgestürzt. Dein Spielstand ist noch gespeichert. Lade die Seite neu; hilft das nicht,
          kannst du neu starten.
        </p>
        <button className="combine-btn" onClick={() => location.reload()}>Neu laden</button>
        <br />
        <button className="combine-btn" onClick={this.reset} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          Spielstand löschen
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
