import { useEffect, useState } from 'react';

export type WatchBias = 'long' | 'short' | 'watch';

export type WatchItem = {
  symbol: string;
  bias: WatchBias;
  note: string;
};

export type Watchlist = {
  updated: string | null;
  items: WatchItem[];
  loading: boolean;
};

/** Lit la watchlist publique servie en statique (web/public/watchlist.json). */
export function useWatchlist(): Watchlist {
  const [state, setState] = useState<Watchlist>({
    updated: null,
    items: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/watchlist.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        setState({
          updated: data.updated ?? null,
          items: Array.isArray(data.items) ? data.items : [],
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function biasLabel(bias: WatchBias): string {
  if (bias === 'long') return 'Biais long';
  if (bias === 'short') return 'Biais short';
  return 'Sous surveillance';
}
