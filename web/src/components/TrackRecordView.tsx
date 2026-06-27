import { useMemo } from 'react';
import { formatUsd, type HistoryEvent } from '../lib/calculations';
import { displaySymbol } from '../api/hyperliquid';
import { useLang } from '../i18n';
import { getTerminalCopy } from '../i18n/terminal';

type Props = {
  history: HistoryEvent[];
  allTimePnl: number;
  loading: boolean;
};

type Monthly = { key: string; label: string; pnl: number };

function monthLabel(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

const CW = 600;
const CH = 150;

/** Trace ligne + aire pour la courbe cumulée (démarre à 0). */
function cumPaths(values: number[]): { line: string; area: string } | null {
  if (values.length < 2) return null;
  const series = [0, ...values];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pad = CH * 0.12;
  const pts = series.map((v, i) => ({
    x: (i / (series.length - 1)) * CW,
    y: CH - pad - ((v - min) / span) * (CH - pad * 2),
  }));
  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${CW},${CH} L0,${CH} Z`;
  return { line, area };
}

export function TrackRecordView({ history, allTimePnl, loading }: Props) {
  const [lang] = useLang();
  const t = getTerminalCopy(lang);
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
          <p className="tr-empty-title">{t.trkEmptyTitle}</p>
          <p className="tr-empty-text">{t.trkEmptyText}</p>
        </div>
      </div>
    );
  }

  const cumUp = allTimePnl >= 0;
  const curve = cumPaths(stats.cumPoints);
  const curveColor = cumUp ? 'var(--green)' : 'var(--red)';

  return (
    <div className="trk">
      <div className="trk-hero">
        <span className="tr-label">{t.trkLabel}</span>
        <div className={`trk-total ${cumUp ? 'pos' : 'neg'}`}>
          {formatUsd(allTimePnl, true)}
        </div>
        <span className="trk-hero-sub">{t.trkSub(stats.count, stats.winRate ?? 0)}</span>
      </div>

      {curve && (
        <svg className="trk-curve" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trk-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={curveColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={curveColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={curve.area} fill="url(#trk-grad)" stroke="none" />
          <path
            d={curve.line}
            fill="none"
            stroke={curveColor}
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div className="trk-kpis">
        <div className="trk-kpi">
          <span>{t.trkProfitFactor}</span>
          <b>{stats.profitFactor != null ? stats.profitFactor.toFixed(2) : 'n/a'}</b>
        </div>
        <div className="trk-kpi">
          <span>{t.trkAvgWin}</span>
          <b className="pos">{formatUsd(stats.avgWin, true)}</b>
        </div>
        <div className="trk-kpi">
          <span>{t.trkAvgLoss}</span>
          <b className="neg">{formatUsd(-stats.avgLoss, true)}</b>
        </div>
        <div className="trk-kpi">
          <span>{t.trkDrawdown}</span>
          <b className="neg">{formatUsd(-stats.maxDd, true)}</b>
        </div>
      </div>

      <div className="trk-section">{t.trkMonthly}</div>
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
            <span className="trk-extreme-label">{t.trkBest}</span>
            <div className="trk-extreme-row">
              <b>{displaySymbol(stats.best.coin)}</b>
              <span className="pos">{formatUsd(stats.best.netPnl, true)}</span>
            </div>
          </div>
        )}
        {stats.worst && (
          <div className="trk-extreme">
            <span className="trk-extreme-label">{t.trkWorst}</span>
            <div className="trk-extreme-row">
              <b>{displaySymbol(stats.worst.coin)}</b>
              <span className="neg">{formatUsd(stats.worst.netPnl, true)}</span>
            </div>
          </div>
        )}
      </div>

      <p className="trk-disclaimer">{t.trkDisclaimer}</p>
    </div>
  );
}
