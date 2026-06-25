import { BRAND_NAME } from '../constants';
import { displaySymbol } from '../api/hyperliquid';
import {
  formatPct,
  formatTradePrice,
  formatUsd,
  type PnlCardData,
} from '../lib/pnlCard';
import './PnlShareCard.css';

type Props = {
  data: PnlCardData;
  className?: string;
  /** Carte dédiée à l'export PNG (layout figé) */
  forExport?: boolean;
};

export function PnlShareCard({ data, className = '', forExport = false }: Props) {
  const win = data.isWin;
  const closedLabel = new Date(data.closedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      className={`pc ${win ? 'pc--win' : 'pc--loss'} ${forExport ? 'pc--export' : ''} ${className}`.trim()}
      aria-label={`Carte PnL ${displaySymbol(data.coin)} ${data.side}`}
    >
      <header className="pc-top">
        <span className="pc-brand">{BRAND_NAME}</span>
        <span className="pc-badges">
          <span className={`pc-side ${data.side === 'LONG' ? 'long' : 'short'}`}>
            {data.side}
          </span>
          {data.leverage != null && <span className="pc-lev">×{data.leverage}</span>}
        </span>
      </header>

      <div className="pc-sym">{displaySymbol(data.coin)}</div>

      <div className="pc-hero">
        <span className="pc-arrow">{win ? '↑' : '↓'}</span>
        <span className="pc-pct tabular">{formatPct(data.pnlPct)}</span>
      </div>
      <div className="pc-pnl tabular">{formatUsd(data.netPnl, true)}</div>

      <div className="pc-grid">
        <div className="pc-cell">
          <span>Entrée</span>
          <b className="tabular">{formatTradePrice(data.entryPx)}</b>
        </div>
        <div className="pc-cell">
          <span>Sortie</span>
          <b className="tabular">{formatTradePrice(data.exitPx)}</b>
        </div>
        <div className="pc-cell">
          <span>Durée</span>
          <b>{data.durationLabel}</b>
        </div>
      </div>

      <footer className="pc-foot">
        <span>{closedLabel}</span>
        <span>{data.closeProofLabel ? `Clôture HL · ${data.closeProofLabel}` : 'Vérifié on-chain'}</span>
      </footer>
    </article>
  );
}
