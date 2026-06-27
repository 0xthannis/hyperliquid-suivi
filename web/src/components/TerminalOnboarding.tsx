import { useState } from 'react';

const KEY = 'thannis_terminal_onboarding_v1';

const STEPS = [
  'Chaque position affichée est réelle et publique, lue directement on-chain.',
  'Sens, levier, entrée, stop et objectif sont visibles. Suivez-les comme des signaux.',
  'Activez les alertes pour être prévenu à chaque ouverture, ajustement et clôture.',
];

export function TerminalOnboarding() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function close() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* stockage indisponible */
    }
    setDismissed(true);
  }

  return (
    <div className="tro" role="note">
      <button type="button" className="tro-close" onClick={close} aria-label="Fermer">
        ×
      </button>
      <div className="tro-title">Comment lire ce terminal</div>
      <div className="tro-steps">
        {STEPS.map((s, i) => (
          <div className="tro-step" key={i}>
            <span className="tro-num">{i + 1}</span>
            <p>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
