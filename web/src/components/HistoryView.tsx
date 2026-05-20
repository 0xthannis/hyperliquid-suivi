import { computeHistorySummary, formatUsd, timeAgo, type HistoryEvent } from '../lib/calculations';

type Props = {
  history: HistoryEvent[];
  allTimePnl: number;
  loading: boolean;
};

export function HistoryView({ history, allTimePnl, loading }: Props) {
  const summary = computeHistorySummary(history, allTimePnl);
  const winRate =
    summary.closedCount > 0
      ? ((summary.winCount / summary.closedCount) * 100).toFixed(0)
      : '0';

  if (loading && history.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="content">
      <h2 className="section-title" style={{ marginTop: '0.75rem' }}>
        Historique
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Le total All Time correspond au portfolio Hyperliquid.
      </p>

      {summary.closedCount > 0 && (
        <section className="summary-card">
          <p className="hero-label">PnL total fermé (All Time)</p>
          <p
            className={`summary-total tabular ${summary.allTimePnl >= 0 ? 'positive' : 'negative'}`}
          >
            {formatUsd(summary.allTimePnl, true)}
          </p>
          <p className="summary-hint">Même chiffre que Hyperliquid · perpétuels</p>
          <div className="summary-grid">
            <div className="summary-mini">
              <label>Taux de réussite</label>
              <span>{winRate}%</span>
            </div>
            <div className="summary-mini">
              <label>Gagnants</label>
              <span className="positive">{summary.winCount}</span>
            </div>
            <div className="summary-mini">
              <label>Perdants</label>
              <span className="negative">{summary.lossCount}</span>
            </div>
          </div>
        </section>
      )}

      {history.length === 0 ? (
        <div className="empty">
          <h3>Pas encore d'historique</h3>
          <p>Les trades de Neymo apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              margin: '1rem 0 0.5rem',
            }}
          >
            Détail des opérations
          </p>
          {history.map((e) => (
            <article key={e.id} className="history-item">
              <div className="history-row">
                <div>
                  <p className="history-coin">{e.coin}</p>
                  <p className="history-label">{e.label}</p>
                </div>
                <span className="history-time">{timeAgo(e.time)}</span>
              </div>
              {e.isClose && (
                <p
                  className={`history-pnl tabular ${e.netPnl >= 0 ? 'positive' : 'negative'}`}
                >
                  {formatUsd(e.netPnl, true)}
                </p>
              )}
            </article>
          ))}
        </>
      )}
    </div>
  );
}
