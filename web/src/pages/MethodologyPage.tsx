import { Link } from 'react-router-dom';
import {
  API_SOURCE_LABEL,
  BRAND_NAME,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import { useLang } from '../i18n';
import { getPagesCopy } from '../i18n/pages';
import './MethodologyPage.css';

export function MethodologyPage() {
  const [lang] = useLang();
  const p = getPagesCopy(lang);
  const c = p.methodology;

  return (
    <div className="methodology">
      <header className="methodology-nav">
        <Link to="/" className="methodology-back">
          {p.common.home}
        </Link>
        <span className="methodology-logo">{BRAND_NAME}</span>
        <Link to="/about" className="methodology-back-secondary">
          {p.common.about}
        </Link>
        <Link to="/app" className="methodology-cta">
          {TERMINAL_NAME}
        </Link>
      </header>

      <main className="methodology-main">
        <p className="methodology-eyebrow">{c.eyebrow}</p>
        <h1>{c.h1}</h1>
        <p className="methodology-lead">{c.lead}</p>

        <div className="methodology-wallet">
          <span className="metric-label">{c.walletLabel}</span>
          <a
            href={hyperliquidExplorerUrl(TRADER_WALLET)}
            target="_blank"
            rel="noopener noreferrer"
            className="methodology-wallet-link tabular"
          >
            {truncateWallet(TRADER_WALLET, 8, 6)}
          </a>
          <span className="methodology-wallet-hint">{API_SOURCE_LABEL}</span>
        </div>

        {c.sections.map((s) => (
          <section key={s.title} className="methodology-section">
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </main>

      <footer className="methodology-footer">{c.footer}</footer>
    </div>
  );
}
