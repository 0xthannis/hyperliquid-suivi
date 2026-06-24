import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { TerminalTour } from '../components/TerminalTour';
import { useTraderData } from '../hooks/useTraderData';
import { LiveView } from '../components/LiveView';
import { HistoryView } from '../components/HistoryView';
import {
  BRAND_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import '../App.css';

type Tab = 'live' | 'history';

export function TradesApp() {
  const [tab, setTab] = useState<Tab>('live');
  const data = useTraderData();

  return (
    <div className="trx">
      <header className="trx-nav">
        <Link to="/" className="trx-brand">
          {BRAND_NAME}
        </Link>
        <div className={`trx-live ${data.wsConnected ? 'on' : ''}`}>
          <span className="trx-live-dot" />
          {data.wsConnected ? 'En direct' : 'Synchro'}
        </div>
      </header>

      <div className="trx-seg" role="tablist">
        <button
          type="button"
          className={tab === 'live' ? 'is-active' : ''}
          onClick={() => setTab('live')}
        >
          Positions
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'is-active' : ''}
          onClick={() => setTab('history')}
        >
          Historique
        </button>
      </div>

      <main className="trx-main">
        {tab === 'live' ? (
          <LiveView
            positions={data.positions}
            orders={data.orders}
            mids={data.mids}
            accountValue={data.accountValue}
            allTimePnl={data.allTimePnl}
            history={data.history}
            loading={data.loading}
            error={data.error}
            priceTick={data.priceTick}
          />
        ) : (
          <HistoryView
            history={data.history}
            fills={data.fills}
            allTimePnl={data.allTimePnl}
            loading={data.loading}
          />
        )}
      </main>

      <footer className="trx-foot">
        <span>Données Hyperliquid · lecture seule · pas un conseil en investissement</span>
        <span className="trx-foot-links">
          <a
            href={hyperliquidExplorerUrl(TRADER_WALLET)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {truncateWallet(TRADER_WALLET)}
          </a>
          <span aria-hidden> · </span>
          <Link to="/methodology">Méthodologie</Link>
          <span aria-hidden> · </span>
          <Link to="/about">À propos</Link>
        </span>
      </footer>

      <TerminalTour />
      <MobileAppBanner />
    </div>
  );
}
