import type { AssetPosition } from '../api/hyperliquid';

export type ExitMetrics = {
  distToSlPct: number | null;
  distToTpPct: number | null;
  riskReward: number | null;
};

export function computeExitMetrics(
  position: AssetPosition,
  markPrice: number,
  stopPx: number | null,
  tpPx: number | null
): ExitMetrics {
  const { entryPx, isLong } = position;
  let riskReward: number | null = null;

  if (stopPx != null && tpPx != null) {
    if (isLong) {
      const risk = entryPx - stopPx;
      const reward = tpPx - entryPx;
      if (risk > 1e-12 && reward > 0) riskReward = reward / risk;
    } else {
      const risk = stopPx - entryPx;
      const reward = entryPx - tpPx;
      if (risk > 1e-12 && reward > 0) riskReward = reward / risk;
    }
  }

  let distToSlPct: number | null = null;
  let distToTpPct: number | null = null;

  if (stopPx != null && markPrice > 0) {
    if (isLong && markPrice > stopPx) {
      distToSlPct = ((markPrice - stopPx) / markPrice) * 100;
    } else if (!isLong && markPrice < stopPx) {
      distToSlPct = ((stopPx - markPrice) / markPrice) * 100;
    } else {
      distToSlPct = 0;
    }
  }

  if (tpPx != null && markPrice > 0) {
    if (isLong && markPrice < tpPx) {
      distToTpPct = ((tpPx - markPrice) / markPrice) * 100;
    } else if (!isLong && markPrice > tpPx) {
      distToTpPct = ((markPrice - tpPx) / markPrice) * 100;
    } else {
      distToTpPct = 0;
    }
  }

  return { distToSlPct, distToTpPct, riskReward };
}

export function formatRiskReward(rr: number | null): string {
  if (rr == null || !Number.isFinite(rr)) return 'N/A';
  return `1:${rr.toFixed(2)}`;
}
