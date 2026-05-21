import { useMemo, useState } from 'react';
import type { Fill } from '../api/hyperliquid';
import {
  computeHistorySummary,
  formatDateTime,
  formatUsd,
  timeAgo,
  type HistoryEvent,
} from '../lib/calculations';
import { exportHistoryCsv } from '../lib/exportCsv';
import {
  computeWeeklySummary,
  formatWeeklySummaryLine,
} from '../lib/weeklySummary';
import { historyEventToPnlCard, type PnlCardData } from '../lib/pnlCard';
import { PnlCardModal } from './PnlCardModal';
import { TermLabel } from './TermLabel';
import './PnlShareCard.css';

type Props = {
  history: HistoryEvent[];
  fills: Fill[];
  allTimePnl: number;
  loading: boolean;
};

type PeriodFilter = 'all' | '7d' | '30d';

function filterByPeriod(events: HistoryEvent[], period: PeriodFilter): HistoryEvent[] {
  if (period === 'all') return events;
  const ms = period === '7d' ? 7 : 30;
  const since = Date.now() - ms * 24 * 60 * 60 * 1000;
  return events.filter((e) => e.time >= since);
}

export function HistoryView({ history, fills, allTimePnl, loading }: Props) {
  const [coinFilter, setCoinFilter] = useState<string>('all');
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [search, setSearch] = useState('');
  const [pnlCardData, setPnlCardData] = useState<PnlCardData | null>(null);

  function openPnlCard(event: HistoryEvent) {
    const card = historyEventToPnlCard(event, fills);
    if (card) setPnlCardData(card);
  }

  const coins = useMemo(() => {
    const set = new Set(history.map((e) => e.coin));
    return Array.from(set).sort();
  }, [history]);

  const filtered = useMemo(() => {
    let list = filterByPeriod(history, period);
    if (coinFilter !== 'all') list = list.filter((e) => e.coin === coinFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.coin.toLowerCase().includes(q) ||
          e.label.toLowerCase().includes(q)
      );
    }
    return list;
  }, [history, period, coinFilter, search]);

  const summary = computeHistorySummary(history, allTimePnl);
  const weekly = computeWeeklySummary(history);
  const winRate =
    summary.closedCount > 0
      ? ((summary.winCount / summary.closedCount) * 100).toFixed(0)
      : '0';

  if (loading && history.length === 0) {
    return (
      <div className="terminal-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="terminal-panel">
      <p className="panel-intro">
        PnL All Time issu du portfolio Hyperliquid de ce wallet. L'historique détaillé
        correspond à l'activité enregistrée sur la plateforme.
      </p>

      {weekly && (
        <div className="weekly-summary">
          <p className="weekly-summary-label">Résumé des 7 derniers jours</p>
          <p className="weekly-summary-value tabular">{formatWeeklySummaryLine(weekly)}</p>
        </div>
      )}

      {summary.closedCount > 0 && (
        <section className="metrics-row metrics-row--triple">
          <div className="metric-panel">
            <TermLabel term="pnlAllTime" className="metric-label" />
            <span
              className={`metric-value tabular ${summary.allTimePnl >= 0 ? 'positive' : 'negative'}`}
            >
              {formatUsd(summary.allTimePnl, true)}
            </span>
          </div>
          <div className="metric-panel">
            <TermLabel term="tauxReussite" className="metric-label" />
            <span className="metric-value tabular">{winRate}%</span>
            <span className="metric-hint">
              {summary.winCount}G / {summary.lossCount}P
            </span>
          </div>
          <div className="metric-panel">
            <TermLabel term="operationsFermees" className="metric-label" />
            <span className="metric-value tabular">{summary.closedCount}</span>
          </div>
        </section>
      )}

      <div className="panel-head">
        <h2 className="panel-title">Journal des opérations</h2>
        <div className="panel-head-actions">
          <span className="panel-badge">{filtered.length}</span>
          {history.length > 0 && (
            <button
              type="button"
              className="btn-export"
              onClick={() => exportHistoryCsv(filtered)}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-filters">
          <input
            type="search"
            className="history-filter-input"
            placeholder="Rechercher actif ou opération…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher dans le journal"
          />
          <select
            className="history-filter-select"
            value={coinFilter}
            onChange={(e) => setCoinFilter(e.target.value)}
            aria-label="Filtrer par actif"
          >
            <option value="all">Tous les actifs</option>
            {coins.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="history-filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            aria-label="Filtrer par période"
          >
            <option value="all">Toute la période</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
          </select>
        </div>
      )}

      {history.length === 0 ? (
        <div className="terminal-empty">
          <p className="terminal-empty-title">Historique vide</p>
          <p className="terminal-empty-text">
            Les opérations enregistrées par Hyperliquid s'afficheront ici dès qu'une
            activité sera disponible sur le wallet suivi.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="terminal-empty">
          <p className="terminal-empty-title">Aucun résultat</p>
          <p className="terminal-empty-text">
            Modifiez les filtres ou la recherche pour afficher d'autres opérations.
          </p>
        </div>
      ) : (
        <>
          <div className="journal-table-wrap">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Actif</th>
                  <th>Opération</th>
                  <th className="journal-th-right">PnL net</th>
                  <th className="journal-th-actions" aria-label="Carte PnL" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="tabular journal-date">{formatDateTime(e.time)}</td>
                    <td className="journal-coin-cell">{e.coin}</td>
                    <td>{e.label}</td>
                    <td className="journal-th-right">
                      {e.isClose ? (
                        <span
                          className={`tabular ${e.netPnl >= 0 ? 'positive' : 'negative'}`}
                        >
                          {formatUsd(e.netPnl, true)}
                        </span>
                      ) : (
                        <span className="journal-na">N/A</span>
                      )}
                    </td>
                    <td className="journal-th-actions">
                      {e.isClose && (
                        <button
                          type="button"
                          className="btn-pnl-card"
                          onClick={() => openPnlCard(e)}
                        >
                          Card
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="journal-list journal-list--mobile">
            {filtered.map((e) => (
              <article key={e.id} className="journal-row">
                <div className="journal-main">
                  <div className="journal-top">
                    <span className="journal-coin">{e.coin}</span>
                    <span className="journal-time">{timeAgo(e.time)}</span>
                  </div>
                  <p className="journal-label">{e.label}</p>
                </div>
                <div className="journal-row-end">
                  {e.isClose && (
                    <>
                      <span
                        className={`journal-pnl tabular ${e.netPnl >= 0 ? 'positive' : 'negative'}`}
                      >
                        {formatUsd(e.netPnl, true)}
                      </span>
                      <button
                        type="button"
                        className="btn-pnl-card"
                        onClick={() => openPnlCard(e)}
                      >
                        Card
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {pnlCardData && (
        <PnlCardModal data={pnlCardData} onClose={() => setPnlCardData(null)} />
      )}
    </div>
  );
}
