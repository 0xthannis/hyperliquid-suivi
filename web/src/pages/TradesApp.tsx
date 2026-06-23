import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { TerminalUnavailable } from '../components/TerminalUnavailable';
import { BRAND_NAME, TERMINAL_NAME } from '../constants';
import '../App.css';
import '../components/TerminalUnavailable.css';

export function TradesApp() {
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
              <span className="terminal-sub">{BRAND_NAME}</span>
            </div>
          </div>
          <div className="terminal-status">
            <span className="terminal-status-dot" />
            <span>Indisponible</span>
          </div>
        </header>

        <main className="terminal-main">
          <TerminalUnavailable embedded />
        </main>

        <footer className="terminal-footer">
          <p>
            Suivi wallet suspendu · Accès gratuit · Pas un conseil en investissement
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
      <MobileAppBanner />
    </div>
  );
}
