import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLandingSnapshot } from '../hooks/useLandingSnapshot';
import { formatUsd, formatPct } from '../lib/calculations';
import { useLang } from '../i18n';
import { getPagesCopy } from '../i18n/pages';
import {
  BRAND_NAME,
  OWNERSHIP_MESSAGE,
  OWNERSHIP_SIGNATURE,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import './VerifiedPage.css';

function daysSince(ts: number | null): number | null {
  if (ts == null) return null;
  return Math.max(1, Math.floor((Date.now() - ts) / 86_400_000));
}

export function VerifiedPage() {
  const snap = useLandingSnapshot();
  const [copied, setCopied] = useState(false);
  const days = daysSince(snap.sinceTs);
  const [lang] = useLang();
  const p = getPagesCopy(lang);
  const c = p.verified;

  function copyWallet() {
    navigator.clipboard?.writeText(TRADER_WALLET).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  return (
    <div className="vf">
      <header className="vf-nav">
        <Link to="/" className="vf-back">{p.common.home}</Link>
        <span className="vf-logo">{BRAND_NAME}</span>
        <Link to="/app" className="vf-cta">{TERMINAL_NAME}</Link>
      </header>

      <main className="vf-main">
        <p className="vf-eyebrow">{c.eyebrow}</p>
        <h1>{c.h1}</h1>
        <p className="vf-lead">{c.lead}</p>

        <div className="vf-counters">
          <div className="vf-counter">
            <span className="vf-counter-value">{days != null ? days : 'n/a'}</span>
            <span className="vf-counter-label">{c.daysLabel}</span>
          </div>
          <div className="vf-counter">
            <span className="vf-counter-value">{snap.closedCount || 'n/a'}</span>
            <span className="vf-counter-label">{c.tradesLabel}</span>
          </div>
          <div className="vf-counter">
            <span className="vf-counter-value">0</span>
            <span className="vf-counter-label">{c.hiddenLabel}</span>
          </div>
        </div>

        <section className="vf-block">
          <h2>{c.walletTitle}</h2>
          <p>{c.walletText}</p>
          <div className="vf-wallet">
            <code className="vf-wallet-addr">{TRADER_WALLET}</code>
            <div className="vf-wallet-actions">
              <button type="button" className="vf-wallet-btn" onClick={copyWallet}>
                {copied ? c.copied : c.copy}
              </button>
              <a
                className="vf-wallet-btn vf-wallet-btn--primary"
                href={hyperliquidExplorerUrl(TRADER_WALLET)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.seeExplorer}
              </a>
            </div>
          </div>
        </section>

        <section className="vf-block">
          <h2>{c.riskTitle}</h2>
          <p>{c.riskText}</p>
          <div className="vf-risk">
            <div className="vf-risk-fig">
              <span className="vf-risk-label">{c.accountValue}</span>
              <span className="vf-risk-value">
                {snap.accountValue > 0 ? formatUsd(snap.accountValue) : 'n/a'}
              </span>
            </div>
            <div className="vf-risk-fig">
              <span className="vf-risk-label">{c.exposure}</span>
              <span className="vf-risk-value">
                {snap.exposure > 0 ? formatUsd(snap.exposure) : formatUsd(0)}
              </span>
            </div>
            <div className="vf-risk-fig">
              <span className="vf-risk-label">{c.drawdown}</span>
              <span className="vf-risk-value neg">
                {snap.maxDrawdownPct != null ? formatPct(-snap.maxDrawdownPct) : 'n/a'}
              </span>
            </div>
          </div>
        </section>

        <section className="vf-block">
          <h2>{c.proofTitle}</h2>
          <p>{c.proofText}</p>
          <div className="vf-proof">
            <span className="vf-proof-label">{c.message}</span>
            <p className="vf-proof-msg">{OWNERSHIP_MESSAGE}</p>
            {OWNERSHIP_SIGNATURE ? (
              <>
                <span className="vf-proof-label">{c.signature}</span>
                <code className="vf-proof-sig">{OWNERSHIP_SIGNATURE}</code>
              </>
            ) : (
              <p className="vf-proof-soon">{c.proofSoon}</p>
            )}
          </div>
        </section>

        <div className="vf-foot-links">
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">{p.common.approach}</Link>
          <span aria-hidden> · </span>
          <Link to="/about">{p.common.about}</Link>
        </div>
      </main>
    </div>
  );
}
