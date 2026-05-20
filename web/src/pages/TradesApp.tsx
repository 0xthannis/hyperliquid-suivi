import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { DataScopeBar } from '../components/DataScopeBar';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { TerminalTour } from '../components/TerminalTour';
import { useTraderData } from '../hooks/useTraderData';
import { LiveView } from '../components/LiveView';
import { HistoryView } from '../components/HistoryView';
import { BRAND_NAME, TERMINAL_NAME } from '../constants';
import '../App.css';

type Tab = 'live' | 'history';

export function TradesApp() {
  const [tab, setTab] = useState<Tab>('live');
  const data = useTraderData();

  return (
    <div className="terminal">
      <div className="terminal-frame">
        <header className="terminal-topbar">
          <div className="terminal-brand">
            <Link to="/" className="terminal-back">
              Accueil
            </Link>
            <BrandLogo compact />
            <div className="terminal-brand-text">
              <span className="terminal-logo">{TERMINAL_NAME}</span>
              <span className="terminal-sub">{BRAND_NAME} · Hyperliquid</span>
            </div>
          </div>
          <div
            className={`terminal-status ${data.wsConnected ? 'terminal-status--on' : ''}`}
          >
            <span className="terminal-status-dot" />
            <span>{data.wsConnected ? 'Flux connecté' : 'Synchronisation'}</span>
          </div>
        </header>

        <DataScopeBar lastUpdate={data.lastUpdate} wsConnected={data.wsConnected} />

        <nav className="terminal-tabs" aria-label="Sections du terminal">
          <button
            type="button"
            className={`terminal-tab ${tab === 'live' ? 'is-active' : ''}`}
            onClick={() => setTab('live')}
          >
            Positions
          </button>
          <button
            type="button"
            className={`terminal-tab ${tab === 'history' ? 'is-active' : ''}`}
            onClick={() => setTab('history')}
          >
            Historique
          </button>
        </nav>

        <main className="terminal-main">
          {tab === 'live' ? (
            <LiveView
              positions={data.positions}
              orders={data.orders}
              mids={data.mids}
              accountValue={data.accountValue}
              loading={data.loading}
              error={data.error}
              priceTick={data.priceTick}
            />
          ) : (
            <HistoryView
              history={data.history}
              allTimePnl={data.allTimePnl}
              loading={data.loading}
            />
          )}
        </main>

        <footer className="terminal-footer">
          <p>
            Données Hyperliquid uniquement · Accès gratuit · Pas un conseil en
            investissement
          </p>
          <p>
            <Link to="/about" className="terminal-footer-link">
              À propos
            </Link>
            {' · '}
            <Link to="/methodology" className="terminal-footer-link">
              Méthodologie
            </Link>
          </p>
        </footer>
      </div>
      <TerminalTour />
      <MobileAppBanner />
    </div>
  );
}
