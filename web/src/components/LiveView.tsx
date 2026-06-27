import { useEffect, useMemo, useState, type MouseEvent } from 'react';
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
import { getPushSupport, requestPushPermission, type PushState } from '../lib/push';
import { PnlCardModal } from './PnlCardModal';
import type { PnlCardData } from '../lib/pnlCard';
import { TRADER_WALLET, hyperliquidExplorerUrl } from '../constants';

/** Carte PnL pour une position encore ouverte (snapshot du PnL courant). */
function openPositionCard(p: AssetPosition, price: number): PnlCardData {
  const net = pnlAtPrice(p, price);
  return {
    coin: p.coin,
    side: p.isLong ? 'LONG' : 'SHORT',
    entryPx: p.entryPx,
    exitPx: price,
    size: p.size,
    riskedUsd: 0,
    exitCapitalUsd: 0,
    grossPnl: net,
    totalFees: 0,
    netPnl: net,
    pnlPct: pnlPercent(p, price),
    leverage: p.leverage,
    durationMs: null,
    durationLabel: 'En cours',
    closedAt: Date.now(),
    isWin: net >= 0,
    closeHash: null,
    closeTid: null,
    closeProofLabel: null,
  };
}

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

const CHART_W = 400;
const CHART_H = 120;

/** Points (x,y) en coordonnées viewBox pour la courbe d'équité. */
function chartPoints(values: number[], w = CHART_W, h = CHART_H) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = h * 0.14;
  return values.map((v, i) => ({
    x: values.length > 1 ? (i / (values.length - 1)) * w : w / 2,
    y: h - pad - ((v - min) / span) * (h - pad * 2),
  }));
}

function lineD(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function areaD(pts: { x: number; y: number }[], h = CHART_H) {
  if (pts.length < 2) return '';
  return `${lineD(pts)} L${pts[pts.length - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`;
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
  const [pushState, setPushState] = useState<PushState>(() => getPushSupport());
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [equity, setEquity] = useState<number[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [card, setCard] = useState<PnlCardData | null>(null);

  async function enableAlerts() {
    setPushBusy(true);
    try {
      const r = await requestPushPermission();
      setPushState(r.state);
      setPushMsg(r.message);
    } finally {
      setPushBusy(false);
    }
  }

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
  const pts = useMemo(() => (equity.length >= 2 ? chartPoints(equity) : []), [equity]);
  const hoverPt = hover != null ? pts[hover] : null;
  const hoverVal = hover != null ? equity[hover] : null;

  function onChartMove(e: MouseEvent<HTMLDivElement>) {
    if (pts.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (pts.length - 1)));
  }

  if (loading && positions.length === 0 && equity.length === 0) {
    return (
      <div className="tr">
        <div className="tr-left">
          <span className="tr-label">Valeur du compte</span>
          <div className="tr-skel tr-skel-value" />
          <div className="tr-skel tr-skel-sub" />
          <div className="tr-skel tr-skel-chart" />
          <div className="tr-skel-periods">
            {PERIODS.map(([p]) => (
              <div key={p} className="tr-skel tr-skel-pill" />
            ))}
          </div>
        </div>
        <div className="tr-right">
          <div className="tr-section-label">Positions</div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="tr-skel tr-skel-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tr">
      <div className="tr-left">
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

      {pts.length >= 2 && (
        <div
          className="tr-chart-wrap"
          onMouseMove={onChartMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            className="tr-chart"
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tr-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="tr-area" d={areaD(pts)} fill="url(#tr-grad)" stroke="none" />
            <path
              className="tr-line"
              d={lineD(pts)}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {hoverPt && (
              <>
                <line
                  className="tr-chart-cursor"
                  x1={hoverPt.x}
                  y1="0"
                  x2={hoverPt.x}
                  y2={CHART_H}
                />
                <circle
                  className="tr-chart-dot"
                  cx={hoverPt.x}
                  cy={hoverPt.y}
                  r="3.5"
                  fill={lineColor}
                />
              </>
            )}
          </svg>
          {hoverPt && hoverVal != null && (
            <div
              className="tr-tip"
              style={{
                left: `${(hoverPt.x / CHART_W) * 100}%`,
                top: `${(hoverPt.y / CHART_H) * 100}%`,
              }}
            >
              <b>{formatUsd(hoverVal)}</b>
              {first != null && (
                <span>
                  {hoverVal - first >= 0 ? '+' : ''}
                  {formatUsd(hoverVal - first, true)} sur la période
                </span>
              )}
            </div>
          )}
        </div>
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
      </div>

      <div className="tr-right">
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
                <div className="tr-pos-actions">
                  <button
                    type="button"
                    className="tr-pos-card"
                    onClick={() => setCard(openPositionCard(p, px))}
                  >
                    Carte PnL ↗
                  </button>
                  <a
                    className="tr-verif"
                    href={hyperliquidExplorerUrl(TRADER_WALLET)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vérifié on-chain ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pushState !== 'unsupported' && pushState !== 'granted' && (
        <div className="tr-cta">
          <div className="tr-cta-title">Activez les alertes</div>
          <p className="tr-cta-text">
            Recevez chaque signal — ouverture, SL/TP, clôture — en temps réel, dès qu'une
            position bouge.
          </p>
          <button
            type="button"
            className="tr-cta-btn"
            onClick={enableAlerts}
            disabled={pushBusy || pushState === 'denied'}
          >
            {pushBusy ? 'Activation…' : pushState === 'denied' ? 'Bloquées' : 'Activer les alertes'}
          </button>
          {pushMsg && <p className="tr-cta-note">{pushMsg}</p>}
        </div>
      )}
      </div>

      {card && <PnlCardModal prebuilt={card} onClose={() => setCard(null)} />}
    </div>
  );
}
