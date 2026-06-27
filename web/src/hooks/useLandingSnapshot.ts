import { useEffect, useState } from 'react';
import {
  fetchFills,
  fetchPositions,
  fetchPortfolioPnl,
  fetchAccountValueHistory,
  displaySymbol,
} from '../api/hyperliquid';
import { groupFillsToHistory, timeAgo } from '../lib/calculations';

export type LandingSnapshot = {
  openCount: number;
  openCoins: string[];
  lastActivityTs: number | null;
  lastActivityLabel: string | null;
  accountValue: number;
  allTimePnl: number;
  winRate: number | null;
  closedCount: number;
  equity: number[];
  changePct: number | null;
  exposure: number;
  maxDrawdownPct: number | null;
  sinceTs: number | null;
  loading: boolean;
  error: string | null;
};

const INITIAL: LandingSnapshot = {
  openCount: 0,
  openCoins: [],
  lastActivityTs: null,
  lastActivityLabel: null,
  accountValue: 0,
  allTimePnl: 0,
  winRate: null,
  closedCount: 0,
  equity: [],
  changePct: null,
  exposure: 0,
  maxDrawdownPct: null,
  sinceTs: null,
  loading: true,
  error: null,
};

/** Drawdown max en % depuis la courbe d'équité (pic à creux). */
function computeMaxDrawdownPct(equity: number[]): number | null {
  if (equity.length < 2) return null;
  let peak = equity[0];
  let maxDd = 0;
  for (const v of equity) {
    if (v > peak) peak = v;
    if (peak > 0) {
      const dd = (peak - v) / peak;
      if (dd > maxDd) maxDd = dd;
    }
  }
  return maxDd * 100;
}

export function useLandingSnapshot(): LandingSnapshot {
  const [state, setState] = useState<LandingSnapshot>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [{ positions, accountValue }, fills, pnl, equity] = await Promise.all([
          fetchPositions(),
          fetchFills(),
          fetchPortfolioPnl().catch(() => ({ perpAllTimePnl: 0 })),
          fetchAccountValueHistory('allTime').catch(() => [] as number[]),
        ]);
        if (cancelled) return;

        const sorted = [...fills].sort((a, b) => b.time - a.time);
        const latest = sorted[0] ?? null;

        const closed = groupFillsToHistory(fills).filter((e) => e.isClose);
        const wins = closed.filter((e) => e.isWin).length;
        const winRate = closed.length
          ? Math.round((wins / closed.length) * 100)
          : null;

        const first = equity[0];
        const last = equity[equity.length - 1];
        const changePct =
          first != null && last != null && first !== 0
            ? ((last - first) / Math.abs(first)) * 100
            : null;

        const exposure = positions.reduce(
          (s, p) => s + Math.abs(p.size) * p.entryPx,
          0
        );
        const sinceTs = fills.length
          ? Math.min(...fills.map((f) => f.time))
          : null;

        setState({
          openCount: positions.length,
          openCoins: positions.map((p) => displaySymbol(p.coin)),
          lastActivityTs: latest?.time ?? null,
          lastActivityLabel: latest?.dir ?? null,
          accountValue,
          allTimePnl: pnl.perpAllTimePnl,
          winRate,
          closedCount: closed.length,
          equity,
          changePct,
          exposure,
          maxDrawdownPct: computeMaxDrawdownPct(equity),
          sinceTs,
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
  if (snapshot.loading) return 'Chargement de l\'activité';
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
    parts.push(`Dernière opération ${what} · ${when}`);
  }

  return parts.join(' · ');
}
