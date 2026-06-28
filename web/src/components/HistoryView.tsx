import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { displaySymbol, type Fill } from '../api/hyperliquid';
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
import { PnlCardModal } from './PnlCardModal';
import { useLang } from '../i18n';
import { getTerminalCopy } from '../i18n/terminal';
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
  const [pnlCardEvent, setPnlCardEvent] = useState<HistoryEvent | null>(null);
  const [lang] = useLang();
  const t = getTerminalCopy(lang);

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
      {weekly && (
        <div className="weekly-summary">
          <p className="weekly-summary-label">{t.histWeekly}</p>
          <p className="weekly-summary-value tabular">{formatWeeklySummaryLine(weekly, lang)}</p>
        </div>
      )}

      {summary.closedCount > 0 && (
        <section className="metrics-row metrics-row--triple">
          <div className="metric-panel">
            <span className="metric-label">{t.histMetricPnl}</span>
            <span
              className={`metric-value tabular ${summary.allTimePnl >= 0 ? 'positive' : 'negative'}`}
            >
              {formatUsd(summary.allTimePnl, true)}
            </span>
          </div>
          <div className="metric-panel">
            <span className="metric-label">{t.histMetricWin}</span>
            <span className="metric-value tabular">{winRate}%</span>
            <span className="metric-hint">
              {summary.winCount}{t.histWinShort} / {summary.lossCount}{t.histLossShort}
            </span>
          </div>
          <div className="metric-panel">
            <span className="metric-label">{t.histMetricClosed}</span>
            <span className="metric-value tabular">{summary.closedCount}</span>
          </div>
        </section>
      )}

      <div className="panel-head">
        <h2 className="panel-title">{t.histJournal}</h2>
        <div className="panel-head-actions">
          <span className="panel-badge">{filtered.length}</span>
          {history.length > 0 && (
            <button
              type="button"
              className="btn-export"
              onClick={() => exportHistoryCsv(filtered)}
            >
              {t.histExport}
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-filters">
          <input
            type="search"
            className="history-filter-input"
            placeholder={t.histSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t.histSearch}
          />
          <select
            className="history-filter-select"
            value={coinFilter}
            onChange={(e) => setCoinFilter(e.target.value)}
            aria-label={t.histThAsset}
          >
            <option value="all">{t.histAllAssets}</option>
            {coins.map((c) => (
              <option key={c} value={c}>
                {displaySymbol(c)}
              </option>
            ))}
          </select>
          <select
            className="history-filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            aria-label={t.histAllPeriod}
          >
            <option value="all">{t.histAllPeriod}</option>
            <option value="7d">{t.histLast7}</option>
            <option value="30d">{t.histLast30}</option>
          </select>
        </div>
      )}

      {history.length === 0 ? (
        <div className="terminal-empty">
          <p className="terminal-empty-title">{t.histEmptyTitle}</p>
          <p className="terminal-empty-text">{t.histEmptyText}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="terminal-empty">
          <p className="terminal-empty-title">{t.histNoResultTitle}</p>
          <p className="terminal-empty-text">{t.histNoResultText}</p>
        </div>
      ) : (
        <>
          <div className="journal-table-wrap">
            <table className="journal-table">
              <thead>
                <tr>
                  <th>{t.histThDate}</th>
                  <th>{t.histThAsset}</th>
                  <th>{t.histThOp}</th>
                  <th className="journal-th-right">{t.histThPnl}</th>
                  <th className="journal-th-actions" aria-label="PnL" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="tabular journal-date">{formatDateTime(e.time)}</td>
                    <td className="journal-coin-cell">{displaySymbol(e.coin)}</td>
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
                        <>
                          <button
                            type="button"
                            className="btn-pnl-card"
                            onClick={() => setPnlCardEvent(e)}
                          >
                            Card
                          </button>
                          <Link
                            className="btn-trade-link"
                            to={`/t/${encodeURIComponent(e.id)}`}
                          >
                            ↗
                          </Link>
                        </>
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
                    <span className="journal-coin">{displaySymbol(e.coin)}</span>
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
                        onClick={() => setPnlCardEvent(e)}
                      >
                        Card
                      </button>
                      <Link
                        className="btn-trade-link"
                        to={`/t/${encodeURIComponent(e.id)}`}
                      >
                        ↗
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {pnlCardEvent && (
        <PnlCardModal
          event={pnlCardEvent}
          fills={fills}
          onClose={() => setPnlCardEvent(null)}
        />
      )}
    </div>
  );
}
