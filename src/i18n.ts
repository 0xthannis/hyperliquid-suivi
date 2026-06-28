import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'fr' | 'en';

const KEY = '@thannis_lang';

/** Locale de l'appareil via Intl (Hermes), repli 'en'. */
function detectDeviceLang(): Lang {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || '';
    return loc.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

let current: Lang = detectDeviceLang();
const listeners = new Set<(l: Lang) => void>();

// Charge le choix manuel sauvegardé (async) et met à jour si présent.
AsyncStorage.getItem(KEY)
  .then((v) => {
    if (v === 'fr' || v === 'en') {
      current = v;
      listeners.forEach((fn) => fn(current));
    }
  })
  .catch(() => {});

export function setLang(l: Lang) {
  current = l;
  AsyncStorage.setItem(KEY, l).catch(() => {});
  listeners.forEach((fn) => fn(l));
}

/** Hook réactif : langue courante + setter partagé entre écrans. */
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
