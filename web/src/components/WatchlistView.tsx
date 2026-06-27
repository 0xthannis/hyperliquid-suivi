import { useWatchlist } from '../hooks/useWatchlist';
import { useLang } from '../i18n';
import { getTerminalCopy } from '../i18n/terminal';

export function WatchlistView() {
  const { items, updated, loading } = useWatchlist();
  const [lang] = useLang();
  const t = getTerminalCopy(lang);

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
          <div className="wl-title">{t.wlTitle}</div>
          <p className="wl-sub">{t.wlSub}</p>
        </div>
        {updated && <span className="wl-updated">{t.wlUpdated(updated)}</span>}
      </div>

      {items.length === 0 ? (
        <div className="tr-empty">
          <p className="tr-empty-title">{t.wlEmptyTitle}</p>
          <p className="tr-empty-text">{t.wlEmptyText}</p>
        </div>
      ) : (
        <div className="wl-list">
          {items.map((it, i) => (
            <div className="wl-item" key={`${it.symbol}-${i}`}>
              <div className="wl-item-top">
                <span className="wl-sym">{it.symbol}</span>
                <span className={`wl-bias wl-bias--${it.bias}`}>{t.bias(it.bias)}</span>
              </div>
              <p className="wl-note">{it.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
