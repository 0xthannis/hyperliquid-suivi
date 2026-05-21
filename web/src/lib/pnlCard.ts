import type { Fill } from '../api/hyperliquid';
import {
  formatUsd,
  formatPct,
  type HistoryEvent,
} from './calculations';

export type TradeSide = 'LONG' | 'SHORT';

export type PnlCardData = {
  coin: string;
  side: TradeSide;
  entryPx: number;
  exitPx: number;
  size: number;
  notionalEntry: number;
  notionalExit: number;
  grossPnl: number;
  totalFees: number;
  netPnl: number;
  pnlPct: number;
  durationMs: number | null;
  durationLabel: string;
  closedAt: number;
  isWin: boolean;
};

function normalizeEventTimeMs(time: number): number {
  return time > 1e12 ? time : time * 1000;
}

export function formatTradePrice(px: number): string {
  if (!Number.isFinite(px) || px <= 0) return '—';
  const abs = Math.abs(px);
  if (abs >= 10_000) return px.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  if (abs >= 100) return px.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (abs >= 1) return px.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return px.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 60_000))} min`;
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h < 24) return m > 0 ? `${h} h ${m} min` : `${h} h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d} j ${rh} h` : `${d} j`;
}

function findOpenTimeMs(
  fills: Fill[],
  coin: string,
  closeTimeMs: number,
  isLong: boolean
): number | null {
  const needle = isLong ? 'Open Long' : 'Open Short';
  let best: number | null = null;
  for (const f of fills) {
    if (f.coin !== coin || !f.dir.includes(needle)) continue;
    const t = normalizeEventTimeMs(f.time);
    if (t > closeTimeMs) continue;
    if (best == null || t > best) best = t;
  }
  return best;
}

export function historyEventToPnlCard(
  event: HistoryEvent,
  fills: Fill[] = []
): PnlCardData | null {
  if (!event.isClose || event.totalSz <= 0) return null;

  const isLong = event.dir.includes('Close Long');
  const side: TradeSide = isLong ? 'LONG' : 'SHORT';
  const exitPx = event.avgPx;
  const size = event.totalSz;
  const grossPnl = event.grossPnl;
  const entryPx = isLong
    ? exitPx - grossPnl / size
    : exitPx + grossPnl / size;

  const notionalEntry = Math.abs(entryPx * size);
  const notionalExit = Math.abs(exitPx * size);
  const pnlPct =
    notionalEntry > 1e-8 ? (event.netPnl / notionalEntry) * 100 : 0;

  const closedAt = normalizeEventTimeMs(event.time);
  const openMs = findOpenTimeMs(fills, event.coin, closedAt, isLong);
  const durationMs = openMs != null ? Math.max(0, closedAt - openMs) : null;

  return {
    coin: event.coin,
    side,
    entryPx,
    exitPx,
    size,
    notionalEntry,
    notionalExit,
    grossPnl: event.grossPnl,
    totalFees: event.totalFees,
    netPnl: event.netPnl,
    pnlPct,
    durationMs,
    durationLabel: durationMs != null ? formatDuration(durationMs) : '—',
    closedAt,
    isWin: event.netPnl > 0,
  };
}

export function pnlCardFilename(data: PnlCardData): string {
  const date = new Date(data.closedAt).toISOString().slice(0, 10);
  return `AT-Capital-${data.coin}-${data.side}-${date}.png`;
}

export { formatUsd, formatPct };
