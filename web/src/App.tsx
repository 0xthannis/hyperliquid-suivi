import { useState } from 'react';
import { APP_NAME } from './constants';
import { useTraderData } from './hooks/useTraderData';
import { LiveView } from './components/LiveView';
import { HistoryView } from './components/HistoryView';
import './App.css';

type Tab = 'live' | 'history';

export default function App() {
  const [tab, setTab] = useState<Tab>('live');
  const data = useTraderData();

  return (
    <div className="app">
      <header className="header">
        <img src="/icon.png" alt="" className="header-icon" width={48} height={48} />
        <div className="header-text">
          <h1>{APP_NAME}</h1>
          <p>Suivez les trades de Neymo en temps réel</p>
          <span className="live-badge">
            <span className={`live-dot ${data.wsConnected ? '' : 'off'}`} />
            Temps réel
          </span>
        </div>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'live' ? 'active' : ''}`}
          onClick={() => setTab('live')}
        >
          En ce moment
        </button>
        <button
          type="button"
          className={`tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Historique
        </button>
      </nav>

      {tab === 'live' ? (
        <LiveView
          positions={data.positions}
          orders={data.orders}
          mids={data.mids}
          accountValue={data.accountValue}
          loading={data.loading}
          error={data.error}
          lastUpdate={data.lastUpdate}
          priceTick={data.priceTick}
        />
      ) : (
        <HistoryView
          history={data.history}
          allTimePnl={data.allTimePnl}
          loading={data.loading}
        />
      )}

      <p className="footer-note">
        Données Hyperliquid · Pas un conseil financier
      </p>
    </div>
  );
}
