import { Link } from 'react-router-dom';
import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import { formatUsd, pnlAtPrice } from '../lib/calculations';
import { getPushSupport } from '../lib/push';
import { PositionCard } from './PositionCard';
import { TermLabel } from './TermLabel';

type Props = {
  positions: AssetPosition[];
  orders: TpSlOrder[];
  mids: Record<string, number>;
  accountValue: number;
  loading: boolean;
  error: string | null;
  priceTick: number;
};

export function LiveView({
  positions,
  orders,
  mids,
  accountValue,
  loading,
  error,
  priceTick,
}: Props) {
  const pushState = getPushSupport();

  const totalPnl = positions.reduce((s, p) => {
    const px = mids[p.coin];
    return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
  }, 0);

  if (loading && positions.length === 0) {
    return (
      <div className="terminal-loading">
        <div className="spinner" />
        <p>Chargement du portefeuille…</p>
      </div>
    );
  }

  return (
    <div className="terminal-panel">
      <div className="metrics-row">
        <div className="metric-panel">
          <TermLabel term="valeurCompte" className="metric-label" />
          <span className="metric-value tabular">{formatUsd(accountValue)}</span>
          <span className="metric-hint">Wallet Hyperliquid suivi</span>
        </div>
        <div className="metric-panel">
          <TermLabel term="pnlOuvert" className="metric-label" />
          <span
            className={`metric-value tabular ${positions.length === 0 ? '' : totalPnl >= 0 ? 'positive' : 'negative'}`}
          >
            {positions.length === 0 ? 'N/A' : formatUsd(totalPnl, true)}
          </span>
          <span className="metric-hint">
            {positions.length === 0
              ? 'Aucune position'
              : `${positions.length} position${positions.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {error && <div className="terminal-alert">{error}</div>}

      <div className="panel-head">
        <h2 className="panel-title">Positions ouvertes</h2>
        <span className="panel-badge">{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div className="terminal-empty">
          <p className="terminal-empty-title">Aucune position ouverte</p>
          <p className="terminal-empty-text">
            Le wallet suivi n'a pas de position en cours sur Hyperliquid. Dès qu'une
            position s'ouvre, elle s'affichera ici automatiquement.
          </p>
          <ul className="terminal-empty-tips">
            {pushState !== 'unsupported' && pushState !== 'denied' && (
              <li>
                Activez les alertes depuis la{' '}
                <Link to="/">page d'accueil</Link> pour être prévenu à l'ouverture.
              </li>
            )}
            <li>
              Consultez l'onglet Historique pour les trades déjà fermés.
            </li>
            <li>
              <Link to="/methodology">Méthodologie</Link> : périmètre et source des
              données.
            </li>
          </ul>
        </div>
      ) : (
        <div className="position-stack">
          {positions.map((p) => (
            <PositionCard
              key={`${p.coin}-${priceTick}`}
              position={p}
              orders={orders}
              currentPrice={mids[p.coin]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
