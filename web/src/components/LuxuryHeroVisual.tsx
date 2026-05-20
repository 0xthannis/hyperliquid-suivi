import './LuxuryHeroVisual.css';

type Props = {
  compact?: boolean;
};

export function LuxuryHeroVisual({ compact = false }: Props) {
  return (
    <div className={`lux-visual ${compact ? 'lux-visual--compact' : ''}`} aria-hidden>
      <div className="lux-glow" />
      <div className="lux-grid" />

      <div className="lux-jet">
        <div className="jet-body" />
        <div className="jet-wing" />
        <div className="jet-tail" />
        <div className="jet-window" />
        <div className="jet-trail" />
      </div>

      <div className="lux-metrics">
        <div className="lux-metric">
          <span className="lux-metric-label">Source</span>
          <span className="lux-metric-value">API Hyperliquid</span>
        </div>
        <div className="lux-metric">
          <span className="lux-metric-label">Tarif</span>
          <span className="lux-metric-value">Accès gratuit</span>
        </div>
        <div className="lux-metric lux-metric--gold">
          <span className="lux-metric-label">Périmètre</span>
          <span className="lux-metric-value">Wallet HL uniquement</span>
        </div>
      </div>

      <div className="lux-skyline">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="building" style={{ '--b': i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
