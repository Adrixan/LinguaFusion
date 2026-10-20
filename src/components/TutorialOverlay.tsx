import { useState } from 'react';
import Modal from './Modal';

interface TutorialOverlayProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const tutorialSteps = [
  {
    number: 1,
    title: 'Willkommen bei LinguaFusion!',
    content: 'Entdecke neue Elemente durch Kombination. Du beginnst mit den 4 Grundelementen: Feuer, Wasser, Erde und Luft.'
  },
  {
    number: 2,
    title: 'Kombiniere Elemente',
    content: 'Wähle zwei Elemente aus und kombiniere sie, um neue Elemente zu entdecken. Probier zum Beispiel Feuer + Wasser = Dampf! Du kannst auch ein Element mit sich selbst kombinieren, zum Beispiel Wasser + Wasser.'
  },
  {
    number: 3,
    title: 'Buchstabenrätsel',
    content: 'Wenn du ein neues Element entdeckst, siehst du das Symbol und eine Beschreibung. Tippe den deutschen Namen ein, um es freizuschalten. Umlaute darfst du auch mit ae, oe, ue und ss schreiben.'
  },
  {
    number: 4,
    title: 'Versuche und Überspringen',
    content: 'Du hast unbegrenzt viele Versuche. Nur Rätsel, die du gleich beim ersten Tipp löst, zählen als perfekt. Wenn du nicht weiterkommst, kannst du überspringen und das Element später erneut finden.'
  },
  {
    number: 5,
    title: 'Sammle Abzeichen',
    content: 'Entdecke Elemente, löse Rätsel und sammle Abzeichen. Werde der größte Alchemist!'
  }
];

function TutorialOverlay({ onComplete, onDismiss }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  const step = tutorialSteps[currentStep];

  return (
    <Modal ariaLabel="Tutorial" onClose={handleSkip}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>📚 Tutorial</h2>
          <button
            onClick={handleSkip}
            aria-label="Tutorial überspringen"
            style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.5rem' }}
          >
            ×
          </button>
        </div>

        <div className="tutorial-step">
          <div className="tutorial-number">{step.number}</div>
          <div className="tutorial-content">
            <h4>{step.title}</h4>
            <p>{step.content}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep ? 'var(--accent)' : 'var(--text-muted)',
                opacity: index === currentStep ? 1 : 0.3
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px' }}
            >
              Zurück
            </button>
          )}
          <button 
            onClick={handleNext}
            className="submit-btn"
            style={{ flex: 1 }}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Loslegen!' : 'Weiter'}
          </button>
        </div>
    </Modal>
  );
}

export default TutorialOverlay;
