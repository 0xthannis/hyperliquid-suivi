import type { Fill, HistoricalOrder } from '../api/hyperliquid';
import {
  fetchAssetLeverage,
  fetchHistoricalOrders,
} from '../api/hyperliquid';
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
  riskedUsd: number;
  exitCapitalUsd: number;
  grossPnl: number;
  totalFees: number;
  netPnl: number;
  pnlPct: number;
  leverage: number | null;
  durationMs: number | null;
  durationLabel: string;
  closedAt: number;
  isWin: boolean;
  closeHash: string | null;
  closeTid: number | null;
  closeProofLabel: string | null;
};

export type PnlCardContext = {
  historicalOrders?: HistoricalOrder[];
  leverage?: number | null;
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

function shortHash(hash: string): string {
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
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

function findOpenOid(
  fills: Fill[],
  coin: string,
  closeTimeMs: number,
  isLong: boolean
): number | null {
  const needle = isLong ? 'Open Long' : 'Open Short';
  let best: Fill | null = null;
  for (const f of fills) {
    if (f.coin !== coin || !f.dir.includes(needle)) continue;
    const t = normalizeEventTimeMs(f.time);
    if (t > closeTimeMs) continue;
    if (!best || t > normalizeEventTimeMs(best.time)) best = f;
  }
  return best?.oid ?? null;
}

function stopPxFromOrder(order: HistoricalOrder['order']): number | null {
  const t = parseFloat(order.triggerPx);
  if (order.isTrigger && order.orderType.toLowerCase().includes('stop') && t > 0) {
    return t;
  }
  for (const ch of order.children ?? []) {
    const px = stopPxFromOrder(ch);
    if (px != null) return px;
  }
  return null;
}

function findStopPx(
  coin: string,
  openTimeMs: number,
  closeTimeMs: number,
  openOid: number | null,
  orders: HistoricalOrder[]
): number | null {
  if (openOid != null) {
    for (const row of orders) {
      const o = row.order;
      if (o.coin !== coin || o.oid !== openOid) continue;
      const px = stopPxFromOrder(o);
      if (px != null) return px;
    }
  }

  let best: { px: number; ts: number } | null = null;
  for (const row of orders) {
    const o = row.order;
    if (o.coin !== coin) continue;
    const px = stopPxFromOrder(o);
    if (px == null) continue;
    const ts = o.timestamp;
    if (ts < openTimeMs - 120_000 || ts > closeTimeMs + 60_000) continue;
    if (!best || Math.abs(ts - openTimeMs) < Math.abs(best.ts - openTimeMs)) {
      best = { px, ts };
    }
  }
  return best?.px ?? null;
}

function riskUsdAtStop(
  isLong: boolean,
  entryPx: number,
  stopPx: number,
  size: number
): number {
  if (stopPx <= 0 || size <= 0) return 0;
  if (isLong) return Math.max(0, (entryPx - stopPx) * size);
  return Math.max(0, (stopPx - entryPx) * size);
}

function closeMetaFromFills(
  fills: Fill[],
  coin: string,
  closeTimeMs: number,
  isLong: boolean
): { hash: string | null; tid: number | null } {
  const needle = isLong ? 'Close Long' : 'Close Short';
  for (const f of fills) {
    if (f.coin !== coin || !f.dir.includes(needle)) continue;
    if (Math.abs(normalizeEventTimeMs(f.time) - closeTimeMs) > 5000) continue;
    return { hash: f.hash, tid: f.tid };
  }
  return { hash: null, tid: null };
}

export function historyEventToPnlCard(
  event: HistoryEvent,
  fills: Fill[] = [],
  ctx: PnlCardContext = {}
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

  const closedAt = normalizeEventTimeMs(event.time);
  const openMs = findOpenTimeMs(fills, event.coin, closedAt, isLong);
  const openOid = openMs != null
    ? findOpenOid(fills, event.coin, closedAt, isLong)
    : null;
  const orders = ctx.historicalOrders ?? [];

  const stopPx =
    openMs != null
      ? findStopPx(event.coin, openMs, closedAt, openOid, orders)
      : null;

  let riskedUsd =
    stopPx != null ? riskUsdAtStop(isLong, entryPx, stopPx, size) : 0;

  if (riskedUsd < 1e-6 && event.netPnl < 0) {
    riskedUsd = Math.abs(event.netPnl);
  }

  const exitCapitalUsd =
    riskedUsd > 1e-6 ? riskedUsd + event.netPnl : 0;

  const pnlPct =
    riskedUsd > 1e-6 ? (event.netPnl / riskedUsd) * 100 : 0;

  const durationMs = openMs != null ? Math.max(0, closedAt - openMs) : null;
  const { hash, tid } = closeMetaFromFills(fills, event.coin, closedAt, isLong);

  let closeProofLabel: string | null = null;
  if (tid != null) closeProofLabel = `Fill #${tid}`;
  else if (hash) closeProofLabel = shortHash(hash);

  return {
    coin: event.coin,
    side,
    entryPx,
    exitPx,
    size,
    riskedUsd,
    exitCapitalUsd,
    grossPnl: event.grossPnl,
    totalFees: event.totalFees,
    netPnl: event.netPnl,
    pnlPct,
    leverage: ctx.leverage ?? null,
    durationMs,
    durationLabel: durationMs != null ? formatDuration(durationMs) : '—',
    closedAt,
    isWin: event.netPnl > 0,
    closeHash: hash,
    closeTid: tid,
    closeProofLabel,
  };
}

export async function buildPnlCardData(
  event: HistoryEvent,
  fills: Fill[]
): Promise<PnlCardData | null> {
  const [historicalOrders, leverage] = await Promise.all([
    fetchHistoricalOrders(),
    fetchAssetLeverage(event.coin),
  ]);
  return historyEventToPnlCard(event, fills, {
    historicalOrders,
    leverage,
  });
}

export function pnlCardFilename(data: PnlCardData): string {
  const date = new Date(data.closedAt).toISOString().slice(0, 10);
  return `AT-Capital-${data.coin}-${data.side}-${date}.png`;
}

export { formatUsd, formatPct };
