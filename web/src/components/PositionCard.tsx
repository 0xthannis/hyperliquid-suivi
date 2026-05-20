import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import {
  computeTargetProgress,
  findTpSlForCoin,
  formatPct,
  formatUsd,
  pnlAtPrice,
  pnlPercent,
} from '../lib/calculations';

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
    <article className="card">
      <div className="card-header">
        <span className="card-coin">{coin}</span>
        <span className="card-leverage">Levier ×{leverage}</span>
      </div>

      <p className={`direction ${isLong ? 'positive' : 'negative'}`}>
        {isLong ? "Neymo est à l'achat" : 'Neymo est à la vente'}
      </p>

      <div className="pnl-block">
        <p className="pnl-label">Résultat pour l'instant</p>
        <p className={`pnl-value tabular ${isWin ? 'positive' : 'negative'}`}>
          {formatUsd(livePnl, true)}
        </p>
        <p className={`pnl-pct tabular ${isWin ? 'positive' : 'negative'}`}>
          {formatPct(pct)} · prix {price.toFixed(4)} $
        </p>
      </div>

      {progress && stopLoss && takeProfit && pctText && (
        <div className="progress-wrap">
          <div className="progress-labels">
            <span className="negative">🛑 {formatUsd(lossAtSl ?? 0, true)}</span>
            <span className="positive">🎯 {formatUsd(gainAtTp ?? 0, true)}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress.barPct}%`,
                background:
                  progress.zone === 'danger' ? 'var(--red)' : 'var(--accent)',
              }}
            />
            <div
              className="progress-marker"
              style={{
                left: `${Math.min(99, Math.max(1, progress.barPct))}%`,
                background:
                  progress.zone === 'danger' ? 'var(--red)' : 'var(--accent)',
              }}
            />
          </div>
          <p className="progress-hint">
            Le prix est à {pctText} du chemin vers l'objectif
            {progress.zone === 'danger' && ' · attention, proche du plancher'}
          </p>
        </div>
      )}

      <div className="info-row">
        <div className="chip">
          <p className="chip-label">Prix d'entrée</p>
          <p className="chip-value tabular">{entryPx.toFixed(4)} $</p>
        </div>
        <div className="chip">
          <p className="chip-label">Taille</p>
          <p className="chip-value tabular">{formatUsd(positionValue)}</p>
        </div>
      </div>

      {(stopLoss || takeProfit) && (
        <div className="scenario-box">
          <p className="scenario-title">Et si le prix touche…</p>
          {stopLoss && lossAtSl != null && (
            <div className="scenario-row">
              <div>
                <p className="scenario-label">Le plancher (stop loss)</p>
                <p className="scenario-price">à {stopLoss.triggerPx.toFixed(4)} $</p>
              </div>
              <span className="scenario-amount tabular negative">
                {formatUsd(lossAtSl, true)}
              </span>
            </div>
          )}
          {takeProfit && gainAtTp != null && (
            <div className="scenario-row">
              <div>
                <p className="scenario-label">L'objectif (take profit)</p>
                <p className="scenario-price">à {takeProfit.triggerPx.toFixed(4)} $</p>
              </div>
              <span className="scenario-amount tabular positive">
                {formatUsd(gainAtTp, true)}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
