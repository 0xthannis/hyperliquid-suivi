import { useState } from 'react';
import { useLang } from '../i18n';
import { getTerminalCopy } from '../i18n/terminal';

const KEY = 'thannis_terminal_onboarding_v1';

export function TerminalOnboarding() {
  const [lang] = useLang();
  const t = getTerminalCopy(lang);
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
      <div className="tro-title">{t.onbTitle}</div>
      <div className="tro-steps">
        {t.onbSteps.map((s, i) => (
          <div className="tro-step" key={i}>
            <span className="tro-num">{i + 1}</span>
            <p>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
