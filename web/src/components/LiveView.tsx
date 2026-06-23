import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  displaySymbol,
  fetchAccountValueHistory,
  type AssetPosition,
  type TpSlOrder,
} from '../api/hyperliquid';
import {
  findTpSlForCoin,
  formatPct,
  formatUsd,
  pnlAtPrice,
  pnlPercent,
  type HistoryEvent,
} from '../lib/calculations';
import { getPushSupport } from '../lib/push';

type Props = {
  positions: AssetPosition[];
  orders: TpSlOrder[];
  mids: Record<string, number>;
  accountValue: number;
  allTimePnl: number;
  history: HistoryEvent[];
  loading: boolean;
  error: string | null;
  priceTick: number;
};

function curvePaths(values: number[], w: number, h: number) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = h * 0.12;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return { line, area };
}

export function LiveView({
  positions,
  orders,
  mids,
  accountValue,
  allTimePnl,
  history,
  loading,
  error,
  priceTick,
}: Props) {
  const pushState = getPushSupport();
  const [equity, setEquity] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAccountValueHistory('month')
      .then((s) => !cancelled && setEquity(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountValue]);

  const totalPnl = useMemo(
    () =>
      positions.reduce((s, p) => {
        const px = mids[p.coin];
        return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
      }, 0),
    [positions, mids, priceTick]
  );

  const exposure = useMemo(
    () => positions.reduce((s, p) => s + p.positionValue, 0),
    [positions]
  );

  const winRate = useMemo(() => {
    const closed = history.filter((e) => e.isClose);
    if (closed.length === 0) return null;
    const wins = closed.filter((e) => e.isWin).length;
    return Math.round((wins / closed.length) * 100);
  }, [history]);

  const curve = curvePaths(equity, 600, 120);
  const equityDelta =
    equity.length >= 2 && equity[0] !== 0
      ? ((equity[equity.length - 1] - equity[0]) / Math.abs(equity[0])) * 100
      : null;

  if (loading && positions.length === 0) {
    return (
      <div className="tx-loading">
        <div className="tx-spinner" />
        <p>Connexion à la salle des marchés…</p>
      </div>
    );
  }

  return (
    <div className="tx">
      <section className="tx-equity">
        <div className="tx-equity-head">
          <div>
            <span className="tx-eyebrow">Valeur du compte</span>
            <div className="tx-equity-value tabular">{formatUsd(accountValue)}</div>
            {equityDelta != null && (
              <span
                className={`tx-equity-delta tabular ${equityDelta >= 0 ? 'pos' : 'neg'}`}
              >
                {equityDelta >= 0 ? '▲' : '▼'} {formatPct(equityDelta)} · 30J
              </span>
            )}
          </div>
          <div className="tx-pnl-open">
            <span className="tx-eyebrow">PnL ouvert</span>
            <div
              className={`tx-pnl-open-value tabular ${positions.length === 0 ? '' : totalPnl >= 0 ? 'pos' : 'neg'}`}
            >
              {positions.length === 0 ? formatUsd(0) : formatUsd(totalPnl, true)}
            </div>
          </div>
        </div>

        {curve && (
          <svg className="tx-curve" viewBox="0 0 600 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="txfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c9cff" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#7c9cff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={curve.area} fill="url(#txfill)" />
            <path d={curve.line} fill="none" stroke="#7c9cff" strokeWidth="1.5" />
          </svg>
        )}

        <div className="tx-kpis">
          <div className="tx-kpi">
            <span>PnL all-time</span>
            <b className={`tabular ${allTimePnl >= 0 ? 'pos' : 'neg'}`}>
              {formatUsd(allTimePnl, true)}
            </b>
          </div>
          <div className="tx-kpi">
            <span>Win rate</span>
            <b className="tabular">{winRate != null ? `${winRate}%` : 'n/a'}</b>
          </div>
          <div className="tx-kpi">
            <span>Exposition</span>
            <b className="tabular">{formatUsd(exposure)}</b>
          </div>
          <div className="tx-kpi">
            <span>Positions</span>
            <b className="tabular">{positions.length}</b>
          </div>
        </div>
      </section>

      {error && <div className="tx-alert">{error}</div>}

      <div className="tx-section-head">
        <span className="tx-section-title">Positions ouvertes</span>
        <span className="tx-section-badge tabular">{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div className="tx-empty">
          <p className="tx-empty-title">Aucune position ouverte</p>
          <p className="tx-empty-text">
            La maison n'a pas d'exposition en cours. Dès qu'une position s'ouvre,
            elle apparaît ici en temps réel.
          </p>
          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <p className="tx-empty-text">
              Activez les alertes depuis la <Link to="/">page d'accueil</Link> pour
              être prévenu à l'ouverture.
            </p>
          )}
        </div>
      ) : (
        <div className="tx-table" key={priceTick}>
          <div className="tx-row tx-row--head">
            <span>Marché</span>
            <span>Sens</span>
            <span className="r">Levier</span>
            <span className="r">Entrée</span>
            <span className="r">Mark</span>
            <span className="r">Notionnel</span>
            <span className="r">PnL</span>
          </div>
          {positions.map((p) => {
            const px = mids[p.coin] ?? p.entryPx;
            const live = mids[p.coin] != null ? pnlAtPrice(p, px) : p.unrealizedPnl;
            const pct = pnlPercent(p, px);
            const { stopLoss, takeProfit } = findTpSlForCoin(orders, p.coin);
            const win = live >= 0;
            return (
              <div className="tx-row" key={p.coin}>
                <span className="tx-sym">
                  {displaySymbol(p.coin)}
                  {(stopLoss || takeProfit) && (
                    <span className="tx-sym-exits">
                      {stopLoss && <em>SL {stopLoss.triggerPx}</em>}
                      {takeProfit && <em>TP {takeProfit.triggerPx}</em>}
                    </span>
                  )}
                </span>
                <span className={p.isLong ? 'pos' : 'neg'}>
                  {p.isLong ? 'LONG' : 'SHORT'}
                </span>
                <span className="r tabular">{p.leverage}×</span>
                <span className="r tabular dim">{p.entryPx}</span>
                <span className="r tabular">{px}</span>
                <span className="r tabular dim">{formatUsd(p.positionValue)}</span>
                <span className={`r tabular ${win ? 'pos' : 'neg'}`}>
                  {formatUsd(live, true)}
                  <em className="tx-row-pct"> {formatPct(pct)}</em>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
