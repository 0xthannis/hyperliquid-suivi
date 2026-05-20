import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import { formatUsd, pnlAtPrice } from '../lib/calculations';
import { PositionCard } from './PositionCard';

type Props = {
  positions: AssetPosition[];
  orders: TpSlOrder[];
  mids: Record<string, number>;
  accountValue: number;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  priceTick: number;
};

export function LiveView({
  positions,
  orders,
  mids,
  accountValue,
  loading,
  error,
  lastUpdate,
  priceTick,
}: Props) {
  const totalPnl = positions.reduce((s, p) => {
    const px = mids[p.coin];
    return s + (px != null ? pnlAtPrice(p, px) : p.unrealizedPnl);
  }, 0);

  if (loading && positions.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Chargement des trades…</p>
      </div>
    );
  }

  return (
    <div className="content">
      <section className="hero">
        <p className="hero-label">Compte Neymo</p>
        <p className="hero-value tabular">{formatUsd(accountValue)}</p>
        <p className="hero-sub">Valeur totale sur Hyperliquid</p>

        {positions.length > 0 && (
          <div className="hero-pnl">
            <p className="hero-label">Tous les trades ouverts</p>
            <p
              className={`hero-pnl-value tabular ${totalPnl >= 0 ? 'positive' : 'negative'}`}
            >
              {formatUsd(totalPnl, true)}
            </p>
          </div>
        )}

        {lastUpdate && (
          <p className="sync">
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </section>

      {error && <div className="error-box">{error}</div>}

      <h2 className="section-title">
        {positions.length === 0
          ? 'Aucun trade en cours'
          : `${positions.length} trade${positions.length > 1 ? 's' : ''} en cours`}
      </h2>

      {positions.length === 0 ? (
        <div className="empty">
          <h3>Rien pour l'instant</h3>
          <p>
            Dès que Neymo ouvre une position, elle apparaît ici en temps réel.
          </p>
        </div>
      ) : (
        positions.map((p) => (
          <PositionCard
            key={`${p.coin}-${priceTick}`}
            position={p}
            orders={orders}
            currentPrice={mids[p.coin]}
          />
        ))
      )}
    </div>
  );
}
