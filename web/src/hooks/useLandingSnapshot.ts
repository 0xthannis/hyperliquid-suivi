import { useEffect, useState } from 'react';
import { fetchFills, fetchPositions } from '../api/hyperliquid';
import { timeAgo } from '../lib/calculations';

export type LandingSnapshot = {
  openCount: number;
  openCoins: string[];
  lastActivityTs: number | null;
  lastActivityLabel: string | null;
  loading: boolean;
  error: string | null;
};

export function useLandingSnapshot(): LandingSnapshot {
  const [state, setState] = useState<LandingSnapshot>({
    openCount: 0,
    openCoins: [],
    lastActivityTs: null,
    lastActivityLabel: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [{ positions }, fills] = await Promise.all([
          fetchPositions(),
          fetchFills(),
        ]);
        if (cancelled) return;

        const sorted = [...fills].sort((a, b) => b.time - a.time);
        const latest = sorted[0] ?? null;

        setState({
          openCount: positions.length,
          openCoins: positions.map((p) => p.coin),
          lastActivityTs: latest?.time ?? null,
          lastActivityLabel: latest?.dir ?? null,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e.message : 'Erreur de chargement',
        }));
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return state;
}

export function formatLandingActivity(snapshot: LandingSnapshot): string {
  if (snapshot.loading) return 'Chargement de l\'activité…';
  if (snapshot.error) return 'Activité indisponible pour le moment';

  const parts: string[] = [];
  if (snapshot.openCount > 0) {
    const coins =
      snapshot.openCoins.length <= 3
        ? snapshot.openCoins.join(', ')
        : `${snapshot.openCoins.slice(0, 3).join(', ')} +${snapshot.openCoins.length - 3}`;
    parts.push(
      `${snapshot.openCount} position${snapshot.openCount > 1 ? 's' : ''} ouverte${snapshot.openCount > 1 ? 's' : ''} (${coins})`
    );
  } else {
    parts.push('Aucune position ouverte pour le moment');
  }

  if (snapshot.lastActivityTs != null) {
    const when = timeAgo(snapshot.lastActivityTs);
    const what = snapshot.lastActivityLabel ?? 'activité';
    parts.push(`Dernière opération : ${what} · ${when}`);
  }

  return parts.join(' · ');
}
