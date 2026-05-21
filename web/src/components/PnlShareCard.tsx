import { BRAND_NAME, TERMINAL_NAME } from '../constants';
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

function fmtCapital(value: number): string {
  return value > 1e-6 ? formatUsd(value) : '—';
}

export function PnlShareCard({ data, className = '', forExport = false }: Props) {
  const pnlClass = data.isWin ? 'pnl-card--win' : 'pnl-card--loss';
  const sideClass = data.side === 'LONG' ? 'pnl-card__side--long' : 'pnl-card__side--short';

  const closedLabel = new Date(data.closedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      className={`pnl-card ${pnlClass} ${forExport ? 'pnl-card--export' : ''} ${className}`.trim()}
      aria-label={`Carte PnL ${data.coin} ${data.side}`}
    >
      <div className="pnl-card__glow pnl-card__glow--pnl" aria-hidden />
      <div className="pnl-card__glow pnl-card__glow--gold" aria-hidden />

      <header className="pnl-card__header">
        <div className="pnl-card__brand-block">
          <p className="pnl-card__brand">{BRAND_NAME}</p>
          <p className="pnl-card__terminal">{TERMINAL_NAME}</p>
        </div>
        <div className="pnl-card__badges">
          <span className={`pnl-card__side ${sideClass}`}>{data.side}</span>
          {data.leverage != null && (
            <span className="pnl-card__leverage">×{data.leverage}</span>
          )}
        </div>
      </header>

      <h2 className="pnl-card__coin">{data.coin}</h2>

      <div className="pnl-card__hero">
        <p className="pnl-card__pnl tabular">{formatUsd(data.netPnl, true)}</p>
        <p className="pnl-card__pct tabular">{formatPct(data.pnlPct)}</p>
      </div>

      <div className="pnl-card__prices">
        <div className="pnl-card__cell">
          <span className="pnl-card__label">Entrée</span>
          <span className="pnl-card__value tabular">{formatTradePrice(data.entryPx)}</span>
        </div>
        <div className="pnl-card__cell">
          <span className="pnl-card__label">Sortie</span>
          <span className="pnl-card__value tabular">{formatTradePrice(data.exitPx)}</span>
        </div>
      </div>

      <div className="pnl-card__notionals">
        <div className="pnl-card__cell pnl-card__cell--sm">
          <span className="pnl-card__label">Capital risqué</span>
          <span className="pnl-card__value-sm tabular">{fmtCapital(data.riskedUsd)}</span>
        </div>
        <div className="pnl-card__cell pnl-card__cell--sm">
          <span className="pnl-card__label">Capital sortie</span>
          <span className="pnl-card__value-sm tabular">{fmtCapital(data.exitCapitalUsd)}</span>
        </div>
        <div className="pnl-card__cell pnl-card__cell--sm pnl-card__cell--profit">
          <span className="pnl-card__label">Profit</span>
          <span className="pnl-card__value-sm tabular pnl-card__profit-value">
            {formatUsd(data.netPnl, true)}
          </span>
        </div>
      </div>

      <footer className="pnl-card__footer">
        <div className="pnl-card__footer-left">
          <p className="pnl-card__meta">Durée · {data.durationLabel}</p>
          <p className="pnl-card__date">{closedLabel}</p>
        </div>
        {data.closeProofLabel && (
          <div className="pnl-card__footer-right">
            <p className="pnl-card__proof-label">Clôture HL</p>
            <p className="pnl-card__proof tabular">{data.closeProofLabel}</p>
          </div>
        )}
      </footer>
    </article>
  );
}
