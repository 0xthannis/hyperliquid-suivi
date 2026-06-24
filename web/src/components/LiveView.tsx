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
import { computeExitMetrics, formatRiskReward } from '../lib/riskMetrics';
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

type Period = 'day' | 'week' | 'month' | 'allTime';
const PERIODS: [Period, string][] = [
  ['day', '1J'],
  ['week', '1S'],
  ['month', '1M'],
  ['allTime', 'MAX'],
];

function linePath(values: number[], w: number, h: number) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = h * 0.14;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
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
  const [period, setPeriod] = useState<Period>('month');
  const [equity, setEquity] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAccountValueHistory(period)
      .then((s) => !cancelled && setEquity(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [period, accountValue]);

  const totalPnl = useMemo(
    () =>
      positions.reduce((s, p) => {
        const px = mids[p.coin];
        return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
      }, 0),
    [positions, mids, priceTick]
  );
  const winRate = useMemo(() => {
    const closed = history.filter((e) => e.isClose);
    if (!closed.length) return null;
    return Math.round((closed.filter((e) => e.isWin).length / closed.length) * 100);
  }, [history]);

  const first = equity[0];
  const last = equity[equity.length - 1];
  const changeAbs = first != null && last != null ? last - first : null;
  const changePct =
    first != null && last != null && first !== 0
      ? ((last - first) / Math.abs(first)) * 100
      : null;
  const up = (changeAbs ?? 0) >= 0;
  const lineColor = up ? 'var(--green)' : 'var(--red)';

  if (loading && positions.length === 0 && equity.length === 0) {
    return (
      <div className="tr-loading">
        <div className="tr-spinner" />
      </div>
    );
  }

  return (
    <div className="tr">
      <div className="tr-hero">
        <span className="tr-label">Valeur du compte</span>
        <div className="tr-value">{formatUsd(accountValue)}</div>
        {changeAbs != null && (
          <div className={`tr-change ${up ? 'pos' : 'neg'}`}>
            {up ? '↑' : '↓'} {formatUsd(Math.abs(changeAbs))}
            {changePct != null && <> · {formatPct(changePct)}</>}
          </div>
        )}
      </div>

      {equity.length >= 2 && (
        <svg className="tr-chart" viewBox="0 0 400 120" preserveAspectRatio="none">
          <path d={linePath(equity, 400, 120)} fill="none" stroke={lineColor} strokeWidth="2" />
        </svg>
      )}

      <div className="tr-periods">
        {PERIODS.map(([p, label]) => (
          <button
            key={p}
            type="button"
            className={`tr-period ${period === p ? 'is-active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tr-stats">
        <div className="tr-stat">
          <span>PnL ouvert</span>
          <b className={positions.length ? (totalPnl >= 0 ? 'pos' : 'neg') : ''}>
            {positions.length ? formatUsd(totalPnl, true) : formatUsd(0)}
          </b>
        </div>
        <div className="tr-stat">
          <span>PnL total</span>
          <b className={allTimePnl >= 0 ? 'pos' : 'neg'}>{formatUsd(allTimePnl, true)}</b>
        </div>
        <div className="tr-stat">
          <span>Réussite</span>
          <b>{winRate != null ? `${winRate}%` : 'n/a'}</b>
        </div>
      </div>

      {error && <div className="tr-alert">{error}</div>}

      <div className="tr-section-label">
        Positions <span className="tr-count">{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div className="tr-empty">
          <p className="tr-empty-title">Aucune position ouverte</p>
          <p className="tr-empty-text">
            Dès qu'une position s'ouvre, elle apparaît ici en temps réel.
          </p>
          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <p className="tr-empty-text">
              Activez les alertes depuis la <Link to="/">page d'accueil</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="tr-list" key={priceTick}>
          {positions.map((p) => {
            const px = mids[p.coin] ?? p.entryPx;
            const live = mids[p.coin] != null ? pnlAtPrice(p, px) : p.unrealizedPnl;
            const pct = pnlPercent(p, px);
            const win = live >= 0;
            const { stopLoss, takeProfit } = findTpSlForCoin(orders, p.coin);
            const lossAtSl = stopLoss ? pnlAtPrice(p, stopLoss.triggerPx) : null;
            const gainAtTp = takeProfit ? pnlAtPrice(p, takeProfit.triggerPx) : null;
            const { riskReward } = computeExitMetrics(
              p,
              px,
              stopLoss?.triggerPx ?? null,
              takeProfit?.triggerPx ?? null
            );
            return (
              <div className="tr-pos" key={p.coin}>
                <div className="tr-pos-row">
                  <div className="tr-pos-id">
                    <span className="tr-pos-sym">{displaySymbol(p.coin)}</span>
                    <span className="tr-pos-sub">
                      {p.isLong ? 'Long' : 'Short'} · {p.leverage}× · entrée {p.entryPx}
                    </span>
                  </div>
                  <div className="tr-pos-fig">
                    <span className={`tr-pos-val ${win ? 'pos' : 'neg'}`}>
                      {formatUsd(live, true)}
                    </span>
                    <span className={`tr-pos-pnl ${win ? 'pos' : 'neg'}`}>
                      {formatPct(pct)}
                    </span>
                  </div>
                </div>
                {(stopLoss || takeProfit) && (
                  <div className="tr-pos-risk">
                    <span>
                      SL {stopLoss ? stopLoss.triggerPx : '—'}
                      {lossAtSl != null && (
                        <em className="neg"> {formatUsd(lossAtSl, true)}</em>
                      )}
                    </span>
                    <span>
                      TP {takeProfit ? takeProfit.triggerPx : '—'}
                      {gainAtTp != null && (
                        <em className="pos"> {formatUsd(gainAtTp, true)}</em>
                      )}
                    </span>
                    <span>
                      R:R <em>{formatRiskReward(riskReward)}</em>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
