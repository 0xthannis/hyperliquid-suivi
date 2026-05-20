import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import {
  computeTargetProgress,
  findTpSlForCoin,
  formatPct,
  formatUsd,
  pnlAtPrice,
  pnlPercent,
} from '../lib/calculations';
import {
  computeExitMetrics,
  formatRiskReward,
} from '../lib/riskMetrics';
import { TermLabel } from './TermLabel';

type Props = {
  position: AssetPosition;
  orders: TpSlOrder[];
  currentPrice?: number;
};

export function PositionCard({ position, orders, currentPrice }: Props) {
  const { coin, isLong, unrealizedPnl, entryPx, leverage, positionValue } =
    position;
  const price = currentPrice ?? entryPx;
  const livePnl =
    currentPrice != null ? pnlAtPrice(position, price) : unrealizedPnl;
  const pct = pnlPercent(position, price);
  const isWin = livePnl >= 0;
  const { stopLoss, takeProfit } = findTpSlForCoin(orders, coin);

  const lossAtSl = stopLoss ? pnlAtPrice(position, stopLoss.triggerPx) : null;
  const gainAtTp = takeProfit ? pnlAtPrice(position, takeProfit.triggerPx) : null;
  const exitMetrics = computeExitMetrics(
    position,
    price,
    stopLoss?.triggerPx ?? null,
    takeProfit?.triggerPx ?? null
  );
  const progress =
    stopLoss && takeProfit
      ? computeTargetProgress(position, price, stopLoss.triggerPx, takeProfit.triggerPx)
      : null;

  const pctText =
    progress &&
    (progress.pct >= 0
      ? `${progress.pct.toFixed(0)}%`
      : `-${Math.abs(progress.pct).toFixed(0)}%`);

  return (
    <article className={`position-card ${isLong ? 'position-card--long' : 'position-card--short'}`}>
      <div className="position-card-head">
        <div className="position-card-id">
          <span className="position-coin">{coin}</span>
          <span className={`position-side ${isLong ? 'positive' : 'negative'}`}>
            {isLong ? 'LONG' : 'SHORT'}
          </span>
        </div>
        <span className="position-leverage">×{leverage}</span>
      </div>

      <div className="position-pnl">
        <div className="position-pnl-main">
          <TermLabel term="pnlNonRealise" className="metric-label" />
          <span className={`position-pnl-value tabular ${isWin ? 'positive' : 'negative'}`}>
            {formatUsd(livePnl, true)}
          </span>
        </div>
        <div className="position-pnl-meta tabular">
          <span className={isWin ? 'positive' : 'negative'}>{formatPct(pct)}</span>
          <span className="position-price">
            <TermLabel term="mark">Mark</TermLabel> {price.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="position-risk-row">
        <div className="position-risk-cell">
          <TermLabel term="entree" className="metric-label" />
          <span className="position-field-value tabular">{entryPx.toFixed(4)}</span>
        </div>
        <div className="position-risk-cell">
          <TermLabel term="notionnel" className="metric-label" />
          <span className="position-field-value tabular">{formatUsd(positionValue)}</span>
        </div>
        <div className="position-risk-cell">
          <TermLabel term="distanceSl" className="metric-label" />
          <span className="position-field-value tabular">
            {exitMetrics.distToSlPct != null
              ? `${exitMetrics.distToSlPct.toFixed(0)}%`
              : 'N/A'}
          </span>
        </div>
        <div className="position-risk-cell">
          <TermLabel term="distanceTp" className="metric-label" />
          <span className="position-field-value tabular">
            {exitMetrics.distToTpPct != null
              ? `${exitMetrics.distToTpPct.toFixed(0)}%`
              : 'N/A'}
          </span>
        </div>
        <div className="position-risk-cell">
          <TermLabel term="riskReward" className="metric-label" />
          <span className="position-field-value tabular">
            {formatRiskReward(exitMetrics.riskReward)}
          </span>
        </div>
      </div>

      {progress && stopLoss && takeProfit && pctText && (
        <div className="progress-wrap">
          <div className="progress-labels">
            <span className="negative">SL {formatUsd(lossAtSl ?? 0, true)}</span>
            <span className="positive">TP {formatUsd(gainAtTp ?? 0, true)}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress.barPct}%`,
                background:
                  progress.zone === 'danger' ? 'var(--red)' : 'var(--gold)',
              }}
            />
            <div
              className="progress-marker"
              style={{
                left: `${Math.min(99, Math.max(1, progress.barPct))}%`,
                background:
                  progress.zone === 'danger' ? 'var(--red)' : 'var(--gold)',
              }}
            />
          </div>
          <p className="progress-hint">
            <TermLabel term="progressionTp">Progression vers le TP</TermLabel> : {pctText}
            {progress.zone === 'danger' && '. Proximité du stop loss.'}
          </p>
        </div>
      )}

      {(stopLoss || takeProfit) && (
        <div className="exit-grid">
          <span className="metric-label exit-grid-title">Sorties</span>
          {stopLoss && lossAtSl != null && (
            <div className="exit-row">
              <div>
                <TermLabel term="stopLoss" className="exit-name" />
                <span className="exit-trigger tabular">{stopLoss.triggerPx.toFixed(4)}</span>
              </div>
              <span className="exit-pnl tabular negative">{formatUsd(lossAtSl, true)}</span>
            </div>
          )}
          {takeProfit && gainAtTp != null && (
            <div className="exit-row">
              <div>
                <TermLabel term="takeProfit" className="exit-name" />
                <span className="exit-trigger tabular">{takeProfit.triggerPx.toFixed(4)}</span>
              </div>
              <span className="exit-pnl tabular positive">{formatUsd(gainAtTp, true)}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
