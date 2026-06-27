import { useEffect, useState } from 'react';

export type Lang = 'fr' | 'en';

const KEY = 'thannis_lang';

/** Détecte la langue : préférence sauvegardée, sinon langue du navigateur (fr ou en par défaut). */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    /* localStorage indisponible */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : '') || '';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

let current: Lang = detectLang();
const listeners = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
  } catch {
    /* noop */
  }
  listeners.forEach((fn) => fn(l));
}

/** Hook réactif : renvoie la langue courante et un setter partagé entre composants. */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, set] = useState<Lang>(current);
  useEffect(() => {
    const fn = (l: Lang) => set(l);
    listeners.add(fn);
    set(current);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return [lang, setLang];
}
