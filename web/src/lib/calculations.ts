import type { AssetPosition, Fill, TpSlOrder } from '../api/hyperliquid';

export function pnlAtPrice(position: AssetPosition, exitPrice: number): number {
  const { size, entryPx, isLong } = position;
  if (isLong) return (exitPrice - entryPx) * size;
  return (entryPx - exitPrice) * size;
}

export function findTpSlForCoin(orders: TpSlOrder[], coin: string) {
  const forCoin = orders.filter((o) => o.coin === coin);
  const stopLoss =
    forCoin.find((o) => o.orderType.toLowerCase().includes('stop')) ?? null;
  const takeProfit =
    forCoin.find((o) => o.orderType.toLowerCase().includes('take profit')) ??
    null;
  return { stopLoss, takeProfit };
}

export function formatUsd(value: number, signed = false): string {
  const abs = Math.abs(value);
  const str =
    abs >= 1000
      ? abs.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
      : abs.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  if (!signed) return `${str} $`;
  if (value >= 0) return `+${str} $`;
  return `-${str} $`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} %`;
}

export function pnlPercent(
  position: AssetPosition,
  currentPrice: number
): number {
  const { entryPx, isLong } = position;
  if (entryPx <= 0) return 0;
  if (isLong) return ((currentPrice - entryPx) / entryPx) * 100;
  return ((entryPx - currentPrice) / entryPx) * 100;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} j`;
}

export type HistoryEvent = {
  id: string;
  coin: string;
  dir: string;
  label: string;
  time: number;
  netPnl: number;
  isClose: boolean;
  isWin: boolean;
};

export type HistorySummary = {
  allTimePnl: number;
  closedCount: number;
  winCount: number;
  lossCount: number;
};

export function groupFillsToHistory(fills: Fill[]): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  let i = 0;
  const sorted = [...fills].sort((a, b) => b.time - a.time);

  while (i < sorted.length) {
    const f = sorted[i];
    const batch = [f];
    let j = i + 1;
    while (
      j < sorted.length &&
      sorted[j].coin === f.coin &&
      sorted[j].dir === f.dir &&
      Math.abs(sorted[j].time - f.time) < 5000
    ) {
      batch.push(sorted[j]);
      j++;
    }

    const grossPnl = batch.reduce((s, x) => s + x.closedPnl, 0);
    const totalFees = batch.reduce((s, x) => s + x.fee, 0);
    const netPnl = grossPnl - totalFees;
    const isClose = f.dir.includes('Close');

    events.push({
      id: `${f.time}-${f.coin}-${f.dir}`,
      coin: f.coin,
      dir: f.dir,
      label: simplifyDir(f.dir),
      time: f.time,
      netPnl,
      isClose,
      isWin: isClose ? netPnl > 0 : false,
    });
    i = j;
  }
  return events;
}

export type TargetProgress = {
  pct: number;
  barPct: number;
  zone: 'safe' | 'warn' | 'danger';
};

export function computeTargetProgress(
  position: AssetPosition,
  currentPrice: number,
  stopPx: number | null,
  tpPx: number | null
): TargetProgress | null {
  if (!stopPx || !tpPx) return null;

  let pct: number;
  if (position.isLong) {
    const range = tpPx - position.entryPx;
    if (Math.abs(range) < 1e-12) return null;
    pct = ((currentPrice - position.entryPx) / range) * 100;
  } else {
    const range = position.entryPx - tpPx;
    if (Math.abs(range) < 1e-12) return null;
    pct = ((position.entryPx - currentPrice) / range) * 100;
  }
  const barPct = Math.max(0, Math.min(100, pct));

  let distanceToSlPct = 0;
  if (position.isLong && position.entryPx > stopPx) {
    distanceToSlPct =
      ((position.entryPx - currentPrice) / (position.entryPx - stopPx)) * 100;
  } else if (!position.isLong && position.entryPx < stopPx) {
    distanceToSlPct =
      ((currentPrice - position.entryPx) / (stopPx - position.entryPx)) * 100;
  }

  const zone =
    distanceToSlPct >= 78 ? 'danger' : distanceToSlPct >= 55 ? 'warn' : 'safe';

  return { pct, barPct, zone };
}

export function computeHistorySummary(
  events: HistoryEvent[],
  allTimePnl: number
): HistorySummary {
  const closed = events.filter((e) => e.isClose);
  return {
    allTimePnl,
    closedCount: closed.length,
    winCount: closed.filter((e) => e.netPnl > 0).length,
    lossCount: closed.filter((e) => e.netPnl < 0).length,
  };
}

function simplifyDir(dir: string): string {
  if (dir.includes('Open Long')) return 'Nouvelle position (hausse)';
  if (dir.includes('Open Short')) return 'Nouvelle position (baisse)';
  if (dir.includes('Close Long')) return 'Position fermée (hausse)';
  if (dir.includes('Close Short')) return 'Position fermée (baisse)';
  return dir;
}
