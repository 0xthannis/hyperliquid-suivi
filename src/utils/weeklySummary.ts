import type { HistoryEvent } from './calculations';
import { formatUsd, normalizeEventTimeMs } from './calculations';

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
  const closed = history.filter(
    (e) => e.isClose && normalizeEventTimeMs(e.time) >= since
  );
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

export function formatWeeklySummaryLine(summary: WeeklySummary): string {
  return `${summary.closedCount} clôture${summary.closedCount > 1 ? 's' : ''} · ${formatUsd(summary.netPnl, true)} · ${summary.winRatePct.toFixed(0)} % réussite`;
}
