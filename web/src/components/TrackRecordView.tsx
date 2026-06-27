import { useMemo } from 'react';
import { formatUsd, type HistoryEvent } from '../lib/calculations';
import { displaySymbol } from '../api/hyperliquid';

type Props = {
  history: HistoryEvent[];
  allTimePnl: number;
  loading: boolean;
};

type Monthly = { key: string; label: string; pnl: number };

function monthLabel(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

export function TrackRecordView({ history, allTimePnl, loading }: Props) {
  const stats = useMemo(() => {
    const closed = history
      .filter((e) => e.isClose)
      .sort((a, b) => a.time - b.time);

    const count = closed.length;
    const wins = closed.filter((e) => e.netPnl > 0);
    const losses = closed.filter((e) => e.netPnl < 0);
    const winRate = count ? Math.round((wins.length / count) * 100) : null;
    const grossWin = wins.reduce((s, e) => s + e.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, e) => s + e.netPnl, 0));
    const avgWin = wins.length ? grossWin / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;

    const best = closed.reduce<HistoryEvent | null>(
      (b, e) => (b == null || e.netPnl > b.netPnl ? e : b),
      null
    );
    const worst = closed.reduce<HistoryEvent | null>(
      (w, e) => (w == null || e.netPnl < w.netPnl ? e : w),
      null
    );

    // Courbe cumulée + drawdown max (en $)
    let cum = 0;
    let peak = 0;
    let maxDd = 0;
    const cumPoints: number[] = [];
    for (const e of closed) {
      cum += e.netPnl;
      cumPoints.push(cum);
      if (cum > peak) peak = cum;
      if (peak - cum > maxDd) maxDd = peak - cum;
    }

    // Mensuel
    const byMonth = new Map<string, Monthly>();
    for (const e of closed) {
      const d = new Date(e.time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cur = byMonth.get(key) ?? { key, label: monthLabel(e.time), pnl: 0 };
      cur.pnl += e.netPnl;
      byMonth.set(key, cur);
    }
    const monthly = Array.from(byMonth.values()).sort((a, b) =>
      a.key < b.key ? -1 : 1
    );
    const monthlyMax = Math.max(1, ...monthly.map((m) => Math.abs(m.pnl)));

    return {
      count,
      winRate,
      winsLen: wins.length,
      lossesLen: losses.length,
      avgWin,
      avgLoss,
      profitFactor,
      best,
      worst,
      maxDd,
      cumPoints,
      monthly,
      monthlyMax,
    };
  }, [history]);

  if (loading && history.length === 0) {
    return (
      <div className="trk">
        <div className="tr-skel" style={{ height: 40, width: '50%', borderRadius: 8 }} />
      </div>
    );
  }

  if (stats.count === 0) {
    return (
      <div className="trk">
        <div className="tr-empty">
          <p className="tr-empty-title">Aucun trade clôturé pour l'instant</p>
          <p className="tr-empty-text">
            Le track record se construit à chaque position fermée, public et vérifiable.
          </p>
        </div>
      </div>
    );
  }

  const cumUp = allTimePnl >= 0;

  return (
    <div className="trk">
      <div className="trk-hero">
        <span className="tr-label">Performance cumulée · net</span>
        <div className={`trk-total ${cumUp ? 'pos' : 'neg'}`}>
          {formatUsd(allTimePnl, true)}
        </div>
        <span className="trk-hero-sub">
          {stats.count} trades clôturés · {stats.winRate}% de réussite
        </span>
      </div>

      <div className="trk-kpis">
        <div className="trk-kpi">
          <span>Profit factor</span>
          <b>{stats.profitFactor != null ? stats.profitFactor.toFixed(2) : 'n/a'}</b>
        </div>
        <div className="trk-kpi">
          <span>Gain moyen</span>
          <b className="pos">{formatUsd(stats.avgWin, true)}</b>
        </div>
        <div className="trk-kpi">
          <span>Perte moyenne</span>
          <b className="neg">{formatUsd(-stats.avgLoss, true)}</b>
        </div>
        <div className="trk-kpi">
          <span>Drawdown max</span>
          <b className="neg">{formatUsd(-stats.maxDd, true)}</b>
        </div>
      </div>

      <div className="trk-section">Résultat mensuel</div>
      <div className="trk-months">
        {stats.monthly.map((m) => {
          const w = (Math.abs(m.pnl) / stats.monthlyMax) * 100;
          const pos = m.pnl >= 0;
          return (
            <div className="trk-month" key={m.key}>
              <span className="trk-month-label">{m.label}</span>
              <div className="trk-bar-track">
                <div
                  className={`trk-bar ${pos ? 'pos' : 'neg'}`}
                  style={{ width: `${Math.max(4, w)}%` }}
                />
              </div>
              <span className={`trk-month-val ${pos ? 'pos' : 'neg'}`}>
                {formatUsd(m.pnl, true)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="trk-extremes">
        {stats.best && (
          <div className="trk-extreme">
            <span className="trk-extreme-label">Meilleur trade</span>
            <div className="trk-extreme-row">
              <b>{displaySymbol(stats.best.coin)}</b>
              <span className="pos">{formatUsd(stats.best.netPnl, true)}</span>
            </div>
          </div>
        )}
        {stats.worst && (
          <div className="trk-extreme">
            <span className="trk-extreme-label">Pire trade</span>
            <div className="trk-extreme-row">
              <b>{displaySymbol(stats.worst.coin)}</b>
              <span className="neg">{formatUsd(stats.worst.netPnl, true)}</span>
            </div>
          </div>
        )}
      </div>

      <p className="trk-disclaimer">
        Les performances passées ne préjugent pas des performances futures. Ceci n'est pas
        un conseil en investissement.
      </p>
    </div>
  );
}
