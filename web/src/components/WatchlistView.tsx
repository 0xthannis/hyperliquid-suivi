import { biasLabel, useWatchlist } from '../hooks/useWatchlist';

export function WatchlistView() {
  const { items, updated, loading } = useWatchlist();

  if (loading) {
    return (
      <div className="wl">
        <div className="tr-skel" style={{ height: 64, borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div className="wl">
      <div className="wl-head">
        <div>
          <div className="wl-title">Ce qu'on surveille</div>
          <p className="wl-sub">
            Les marchés que nous guettons avant d'ouvrir une position. Ce ne sont pas
            encore des positions, juste notre radar.
          </p>
        </div>
        {updated && <span className="wl-updated">Mis à jour le {updated}</span>}
      </div>

      {items.length === 0 ? (
        <div className="tr-empty">
          <p className="tr-empty-title">Rien sur le radar pour l'instant</p>
          <p className="tr-empty-text">Les marchés surveillés apparaîtront ici.</p>
        </div>
      ) : (
        <div className="wl-list">
          {items.map((it, i) => (
            <div className="wl-item" key={`${it.symbol}-${i}`}>
              <div className="wl-item-top">
                <span className="wl-sym">{it.symbol}</span>
                <span className={`wl-bias wl-bias--${it.bias}`}>{biasLabel(it.bias)}</span>
              </div>
              <p className="wl-note">{it.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
