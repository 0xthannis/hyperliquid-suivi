import { Link } from 'react-router-dom';
import {
  API_SOURCE_LABEL,
  DATA_SCOPE,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';

type Props = {
  lastUpdate?: Date | null;
  wsConnected?: boolean;
};

const FRESH_MS = 60_000;

export function DataScopeBar({ lastUpdate, wsConnected }: Props) {
  const syncLabel = lastUpdate
    ? `Sync ${lastUpdate.toLocaleTimeString('fr-FR')}`
    : 'En attente de sync';

  const isFresh =
    lastUpdate != null && Date.now() - lastUpdate.getTime() < FRESH_MS;

  const statusOk = Boolean(wsConnected && isFresh);
  const statusLabel = statusOk ? 'Données à jour' : 'Resynchronisation';

  return (
    <div className="data-scope">
      <div className="data-scope-top">
        <p className="data-scope-text">{DATA_SCOPE}</p>
        <span
          className={`sync-badge ${statusOk ? 'sync-badge--ok' : 'sync-badge--warn'}`}
          title={syncLabel}
        >
          <span className="sync-badge-dot" />
          {statusLabel}
        </span>
      </div>
      <div className="data-scope-meta">
        <span className="data-scope-item">{API_SOURCE_LABEL}</span>
        <span className="data-scope-sep">·</span>
        <span className="data-scope-item">
          {wsConnected ? 'WebSocket actif' : 'Polling REST'}
        </span>
        <span className="data-scope-sep">·</span>
        <span className="data-scope-item tabular">{syncLabel}</span>
        <span className="data-scope-sep">·</span>
        <a
          href={hyperliquidExplorerUrl(TRADER_WALLET)}
          target="_blank"
          rel="noopener noreferrer"
          className="data-scope-link tabular"
        >
          {truncateWallet(TRADER_WALLET)}
        </a>
        <span className="data-scope-sep">·</span>
        <Link to="/methodology" className="data-scope-link">
          Méthodologie
        </Link>
      </div>
    </div>
  );
}
