import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { TerminalTour } from '../components/TerminalTour';
import { useTraderData } from '../hooks/useTraderData';
import { LiveView } from '../components/LiveView';
import { HistoryView } from '../components/HistoryView';
import { TrackRecordView } from '../components/TrackRecordView';
import { WatchlistView } from '../components/WatchlistView';
import { TerminalOnboarding } from '../components/TerminalOnboarding';
import { useLang } from '../i18n';
import { getTerminalCopy } from '../i18n/terminal';
import {
  BRAND_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import '../App.css';

type Tab = 'live' | 'watch' | 'history' | 'track';

export function TradesApp() {
  const [tab, setTab] = useState<Tab>('live');
  const data = useTraderData();
  const [lang, setLang] = useLang();
  const t = getTerminalCopy(lang);

  return (
    <div className="trx">
      <header className="trx-nav">
        <Link to="/" className="trx-brand">
          {BRAND_NAME}
        </Link>
        <div className="trx-nav-right">
          <div className={`trx-live ${data.wsConnected ? 'on' : ''}`}>
            <span className="trx-live-dot" />
            {data.wsConnected ? t.live : t.sync}
          </div>
          <button
            type="button"
            className="hx-lang"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label="Language"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <TerminalOnboarding />

      <div className="trx-seg" role="tablist">
        <button
          type="button"
          className={tab === 'live' ? 'is-active' : ''}
          onClick={() => setTab('live')}
        >
          {t.tabs.positions}
        </button>
        <button
          type="button"
          className={tab === 'watch' ? 'is-active' : ''}
          onClick={() => setTab('watch')}
        >
          {t.tabs.watchlist}
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'is-active' : ''}
          onClick={() => setTab('history')}
        >
          {t.tabs.history}
        </button>
        <button
          type="button"
          className={tab === 'track' ? 'is-active' : ''}
          onClick={() => setTab('track')}
        >
          {t.tabs.track}
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
        ) : tab === 'watch' ? (
          <WatchlistView />
        ) : tab === 'history' ? (
          <HistoryView
            history={data.history}
            fills={data.fills}
            allTimePnl={data.allTimePnl}
            loading={data.loading}
          />
        ) : (
          <TrackRecordView
            history={data.history}
            allTimePnl={data.allTimePnl}
            loading={data.loading}
          />
        )}
      </main>

      <footer className="trx-foot">
        <span>{t.foot.legal}</span>
        <span className="trx-foot-links">
          <a
            href={hyperliquidExplorerUrl(TRADER_WALLET)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {truncateWallet(TRADER_WALLET)}
          </a>
          <span aria-hidden> · </span>
          <Link to="/methodology">{t.foot.approach}</Link>
          <span aria-hidden> · </span>
          <Link to="/verifie">{t.foot.verified}</Link>
          <span aria-hidden> · </span>
          <Link to="/about">{t.foot.about}</Link>
        </span>
      </footer>

      <TerminalTour />
      <MobileAppBanner />
    </div>
  );
}
