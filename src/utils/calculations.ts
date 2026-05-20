import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';

/** Gain/perte en $ si le prix atteint le niveau trigger */
export function pnlAtPrice(
  position: AssetPosition,
  exitPrice: number
): number {
  const { size, entryPx, isLong } = position;
  if (isLong) return (exitPrice - entryPx) * size;
  return (entryPx - exitPrice) * size;
}

function isTakeProfitOrder(o: TpSlOrder): boolean {
  return o.orderType.toLowerCase().includes('take profit');
}

function isStopLossOrder(o: TpSlOrder): boolean {
  const t = o.orderType.toLowerCase();
  return t.includes('stop') && !t.includes('take profit');
}

/** Préfère l'ordre lié à la position (celui créé quand le TP est ajouté après le SL) */
function pickTpSlOrder(matches: TpSlOrder[]): TpSlOrder | null {
  if (matches.length === 0) return null;
  return matches.find((o) => o.isPositionTpsl) ?? matches[0];
}

export function findTpSlForCoin(
  orders: TpSlOrder[],
  coin: string
): { stopLoss: TpSlOrder | null; takeProfit: TpSlOrder | null } {
  const forCoin = orders.filter((o) => o.coin === coin);
  return {
    stopLoss: pickTpSlOrder(forCoin.filter(isStopLossOrder)),
    takeProfit: pickTpSlOrder(forCoin.filter(isTakeProfitOrder)),
  };
}

/** PnL net d'une opération : gain/perte du trade − frais payés */
export function computeNetPnlFromFill(closedPnl: number, fee: number): number {
  return closedPnl - fee;
}

/** Hyperliquid renvoie parfois des secondes, parfois des millisecondes */
export function normalizeEventTimeMs(time: number): number {
  return time > 1e12 ? time : time * 1000;
}

export function filterHistoryByDays(
  events: HistoryEvent[],
  days: 7 | 30
): HistoryEvent[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return events.filter((e) => normalizeEventTimeMs(e.time) >= since);
}

export function formatUsd(value: number, signed = false): string {
  const abs = Math.abs(value);
  const str =
    abs >= 1000
      ? abs.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
      : abs.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!signed) return `${str} $`;
  if (value >= 0) return `+${str} $`;
  return `-${str} $`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} %`;
}

export function pnlPercent(position: AssetPosition, currentPrice: number): number {
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

/** Regroupe les fills par opération (même dir + coin proche dans le temps) */
export type HistoryEvent = {
  id: string;
  coin: string;
  dir: string;
  label: string;
  time: number;
  /** PnL brut Hyperliquid (sans frais) */
  grossPnl: number;
  /** Frais de trading cumulés sur l'opération */
  totalFees: number;
  /** PnL réel = brut − frais */
  netPnl: number;
  avgPx: number;
  totalSz: number;
  isClose: boolean;
  isWin: boolean;
};

export type HistorySummary = {
  /** PnL All Time officiel (API portfolio perpAllTime = écran Hyperliquid) */
  allTimePnl: number;
  /** Somme des fermetures visibles dans l'historique chargé */
  fillsClosedNet: number;
  /** Total des frais sur l'historique chargé */
  totalFees: number;
  closedCount: number;
  winCount: number;
  lossCount: number;
};

export function groupFillsToHistory(
  fills: import('../api/hyperliquid').Fill[]
): HistoryEvent[] {
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

    const totalSz = batch.reduce((s, x) => s + x.sz, 0);
    const avgPx =
      batch.reduce((s, x) => s + x.px * x.sz, 0) / (totalSz || 1);
    const grossPnl = batch.reduce((s, x) => s + x.closedPnl, 0);
    const totalFees = batch.reduce((s, x) => s + x.fee, 0);
    const netPnl = grossPnl - totalFees;
    const label = simplifyDir(f.dir);
    const isClose = f.dir.includes('Close');

    events.push({
      id: `${f.time}-${f.coin}-${f.dir}`,
      coin: f.coin,
      dir: f.dir,
      label,
      time: f.time,
      grossPnl,
      totalFees,
      netPnl,
      avgPx,
      totalSz,
      isClose,
      isWin: isClose ? netPnl > 0 : false,
    });
    i = j;
  }
  return events;
}

export type TargetProgress = {
  /** % signé vers l'objectif (négatif si PnL en perte) */
  pct: number;
  /** 0–100 pour la barre visuelle */
  barPct: number;
  distanceToSlPct: number;
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

  return { pct, barPct, distanceToSlPct, zone };
}

export type PeriodStats = {
  todayNet: number;
  weekNet: number;
  todayWinRate: number;
  weekWinRate: number;
  todayClosed: number;
  weekClosed: number;
};

export function computePeriodStats(events: HistoryEvent[]): PeriodStats {
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;

  const closed = events.filter((e) => e.isClose);
  const today = closed.filter(
    (e) => normalizeEventTimeMs(e.time) >= dayStart.getTime()
  );
  const week = closed.filter((e) => normalizeEventTimeMs(e.time) >= weekStart);

  const winRate = (arr: HistoryEvent[]) => {
    if (arr.length === 0) return 0;
    return (arr.filter((e) => e.netPnl > 0).length / arr.length) * 100;
  };

  return {
    todayNet: today.reduce((s, e) => s + e.netPnl, 0),
    weekNet: week.reduce((s, e) => s + e.netPnl, 0),
    todayWinRate: winRate(today),
    weekWinRate: winRate(week),
    todayClosed: today.length,
    weekClosed: week.length,
  };
}

export type StreakInfo = {
  currentWinStreak: number;
  bestWinStreak: number;
  level: number;
  levelLabel: string;
  xpProgress: number;
};

export function computeStreak(events: HistoryEvent[]): StreakInfo {
  const closed = [...events]
    .filter((e) => e.isClose)
    .sort((a, b) => b.time - a.time);

  let currentWinStreak = 0;
  for (const e of closed) {
    if (e.netPnl > 0) currentWinStreak++;
    else break;
  }

  let best = 0;
  let run = 0;
  for (const e of [...closed].reverse()) {
    if (e.netPnl > 0) {
      run++;
      best = Math.max(best, run);
    } else run = 0;
  }

  const wins = closed.filter((e) => e.netPnl > 0).length;
  const level = Math.max(1, Math.floor(wins / 3) + 1);
  const xpInLevel = wins % 3;
  const labels = ['Rookie', 'Challenger', 'Trader', 'Pro', 'Légende'];
  const levelLabel = labels[Math.min(level - 1, labels.length - 1)];

  return {
    currentWinStreak,
    bestWinStreak: best,
    level,
    levelLabel,
    xpProgress: (xpInLevel / 3) * 100,
  };
}

export function computeHistorySummary(
  events: HistoryEvent[],
  allTimePnl: number
): HistorySummary {
  const closed = events.filter((e) => e.isClose);
  const fillsClosedNet = closed.reduce((s, e) => s + e.netPnl, 0);
  const totalFees = events.reduce((s, e) => s + e.totalFees, 0);
  const winCount = closed.filter((e) => e.netPnl > 0).length;
  const lossCount = closed.filter((e) => e.netPnl < 0).length;

  return {
    allTimePnl,
    fillsClosedNet,
    totalFees,
    closedCount: closed.length,
    winCount,
    lossCount,
  };
}

function simplifyDir(dir: string): string {
  if (dir.includes('Open Long')) return 'Ouverture long';
  if (dir.includes('Open Short')) return 'Ouverture short';
  if (dir.includes('Close Long')) return 'Clôture long';
  if (dir.includes('Close Short')) return 'Clôture short';
  return dir;
}
