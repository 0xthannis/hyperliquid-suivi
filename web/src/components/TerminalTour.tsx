import { useEffect, useState } from 'react';
import { TERMINAL_NAME } from '../constants';
import './TerminalTour.css';

const STORAGE_KEY = 'at-capital-terminal-tour-v1';

const STEPS = [
  {
    title: 'Positions en direct',
    text: 'Chaque carte affiche le PnL, le mark, les distances SL/TP et le ratio R:R. Survolez les libellés pour les définitions.',
  },
  {
    title: 'Historique et export',
    text: 'L\'onglet Historique liste les opérations fermées sur Hyperliquid. Filtrez par actif ou période, exportez en CSV.',
  },
  {
    title: 'Données et transparence',
    text: 'La barre en haut indique si les données sont à jour. Le wallet est vérifiable sur l\'explorer Hyperliquid.',
  },
];

type Props = {
  onDone?: () => void;
};

export function TerminalTour({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'done') return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, 'done');
    } catch {
      /* ignore */
    }
    setVisible(false);
    onDone?.();
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="terminal-tour-backdrop" role="dialog" aria-labelledby="tour-title">
      <div className="terminal-tour-card">
        <p className="terminal-tour-eyebrow">{TERMINAL_NAME}</p>
        <h2 id="tour-title" className="terminal-tour-title">
          {current.title}
        </h2>
        <p className="terminal-tour-text">{current.text}</p>
        <div className="terminal-tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`terminal-tour-dot ${i === step ? 'is-active' : ''}`} />
          ))}
        </div>
        <div className="terminal-tour-actions">
          <button type="button" className="terminal-tour-skip" onClick={finish}>
            Passer
          </button>
          {!isLast ? (
            <button
              type="button"
              className="terminal-tour-next"
              onClick={() => setStep((s) => s + 1)}
            >
              Suivant
            </button>
          ) : (
            <button type="button" className="terminal-tour-next" onClick={finish}>
              Compris
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
