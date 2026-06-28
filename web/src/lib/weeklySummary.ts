import type { HistoryEvent } from './calculations';
import { formatUsd } from './calculations';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type WeeklySummary = {
  closedCount: number;
  winCount: number;
  lossCount: number;
  netPnl: number;
  winRatePct: number;
};

export function computeWeeklySummary(history: HistoryEvent[]): WeeklySummary | null {
  const since = Date.now() - WEEK_MS;
  const closed = history.filter((e) => e.isClose && e.time >= since);
  if (closed.length === 0) return null;

  const netPnl = closed.reduce((s, e) => s + e.netPnl, 0);
  const winCount = closed.filter((e) => e.netPnl > 0).length;
  const lossCount = closed.filter((e) => e.netPnl <= 0).length;

  return {
    closedCount: closed.length,
    winCount,
    lossCount,
    netPnl,
    winRatePct: (winCount / closed.length) * 100,
  };
}

export function formatWeeklySummaryLine(
  summary: WeeklySummary,
  lang: 'fr' | 'en' = 'fr'
): string {
  const pnl = formatUsd(summary.netPnl, true);
  const win = summary.winRatePct.toFixed(0);
  if (lang === 'en') {
    return `${summary.closedCount} close${summary.closedCount > 1 ? 's' : ''} · ${pnl} · ${win}% win rate`;
  }
  return `${summary.closedCount} clôture${summary.closedCount > 1 ? 's' : ''} · ${pnl} · ${win} % de réussite`;
}
