import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { useLandingSnapshot, type LandingSnapshot } from '../hooks/useLandingSnapshot';
import { formatUsd, formatPct, timeAgo } from '../lib/calculations';
import { CountUp } from '../components/CountUp';
import { getPushSupport, requestPushPermission } from '../lib/push';
import { useLang } from '../i18n';
import { getLandingCopy, type LandingCopy } from '../i18n/landing';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  APK_DOWNLOAD_PATH,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './LandingPage.css';

const MARKETS_TICKER = [
  'OR', 'ARGENT', 'CUIVRE', 'ALUMINIUM', 'BRENT', 'WTI', 'GAZ NAT.',
  'BLÉ', 'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'MRVL', 'MU', 'AMD',
];

function curveLine(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = h * 0.12;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function activityLine(snap: LandingSnapshot, c: LandingCopy): string {
  if (snap.loading) return c.activity.loading;
  if (snap.error) return c.activity.error;
  const parts: string[] = [];
  if (snap.openCount > 0) {
    const coins =
      snap.openCoins.length <= 3
        ? snap.openCoins.join(', ')
        : `${snap.openCoins.slice(0, 3).join(', ')} +${snap.openCoins.length - 3}`;
    parts.push(c.activity.open(snap.openCount, coins));
  } else {
    parts.push(c.activity.none);
  }
  if (snap.lastActivityTs != null) {
    parts.push(c.activity.last(snap.lastActivityLabel ?? '', timeAgo(snap.lastActivityTs)));
  }
  return parts.join(' · ');
}

function HeroTerminal({ snap, c }: { snap: LandingSnapshot; c: LandingCopy }) {
  const up = (snap.changePct ?? 0) >= 0;
  const color = up ? '#00935f' : '#e5342a';
  const line = curveLine(snap.equity, 320, 86);
  const area = line && `${line} L320,86 L0,86 Z`;

  return (
    <div className="hx-app">
      <div className="hx-app-bar">
        <span className="hx-app-dots"><i /><i /><i /></span>
        <span className="hx-app-title">{BRAND_NAME} · {TERMINAL_NAME}</span>
        <span className="hx-app-live"><span className="hx-app-live-dot" /> LIVE</span>
      </div>
      <div className="hx-app-body">
        <div className="hx-app-acct">
          <span className="hx-app-acct-label">{c.term.accountLabel}</span>
          <span className="hx-app-acct-value">
            {snap.accountValue > 0 ? (
              <CountUp value={snap.accountValue} format={(n) => formatUsd(n)} />
            ) : (
              'n/a'
            )}
          </span>
          {snap.changePct != null && (
            <span className={`hx-app-acct-delta ${up ? 'pos' : 'neg'}`}>
              {up ? '▲' : '▼'} {formatPct(snap.changePct)} · {c.term.deltaSuffix}
            </span>
          )}
        </div>
        {line ? (
          <svg className="hx-curve" viewBox="0 0 320 86" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hxfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#hxfill)" />
            <path d={line} fill="none" stroke={color} strokeWidth="1.6" />
          </svg>
        ) : (
          <div className="hx-curve hx-curve--empty" />
        )}
        <div className="hx-app-kpis">
          <div>
            <span>{c.term.pnlAllTime}</span>
            <b className={snap.allTimePnl >= 0 ? 'pos' : 'neg'}>
              {snap.accountValue > 0 ? (
                <CountUp value={snap.allTimePnl} format={(n) => formatUsd(n, true)} />
              ) : (
                'n/a'
              )}
            </b>
          </div>
          <div>
            <span>{c.term.win}</span>
            <b>
              {snap.winRate != null ? (
                <CountUp value={snap.winRate} format={(n) => `${Math.round(n)}%`} />
              ) : (
                'n/a'
              )}
            </b>
          </div>
          <div>
            <span>{c.term.positions}</span>
            <b>{snap.openCount}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const pushState = getPushSupport();
  const snap = useLandingSnapshot();
  const [lang, setLang] = useLang();
  const c = getLandingCopy(lang);

  async function handlePush() {
    setPushLoading(true);
    setPushMsg(null);
    const result = await requestPushPermission();
    setPushMsg(result.message);
    setPushLoading(false);
  }

  const trackUp = snap.allTimePnl >= 0;

  return (
    <div className="hx">
      <div className="hx-aura" aria-hidden />

      <header className="hx-nav">
        <div className="hx-nav-inner">
          <Link to="/" className="hx-wordmark">
            <span className="hx-wordmark-name">{BRAND_NAME}</span>
            <span className="hx-wordmark-desc">Commodities &amp; Equities</span>
          </Link>
          <nav className="hx-nav-links" aria-label="Navigation">
            <a href="#fonctionnement">{c.nav.how}</a>
            <a href="#fondateurs">{c.nav.founders}</a>
            <a href="#preuve">{c.nav.track}</a>
          </nav>
          <div className="hx-nav-right">
            <button
              type="button"
              className="hx-lang"
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              aria-label="Language"
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <Link to="/app" className="hx-btn hx-btn--primary hx-btn--sm">
              {c.nav.open}
            </Link>
          </div>
        </div>
      </header>

      <section className="hx-hero">
        <div className="hx-hero-copy">
          <span className="hx-pill">
            <span className="hx-pill-dot" />
            {c.hero.pill}
          </span>
          <h1 className="hx-hero-title">
            {c.hero.titleLine1}
            <br />
            {c.hero.titlePre}
            <span className="hx-accent">{c.hero.titleAccent}</span>
            {c.hero.titlePost}
          </h1>
          <p className="hx-hero-lead">{c.hero.lead}</p>
          <div className="hx-hero-actions">
            <Link to="/app" className="hx-btn hx-btn--primary">
              {c.hero.open}
            </Link>
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-btn hx-btn--ghost"
            >
              {c.hero.verify}
            </a>
          </div>
          <div className="hx-hero-live">
            <span className="hx-hero-live-dot" />
            {activityLine(snap, c)}
          </div>
          {pushMsg && <p className="hx-push-msg">{pushMsg}</p>}
        </div>

        <div className="hx-hero-visual">
          <HeroTerminal snap={snap} c={c} />
        </div>
      </section>

      <div className="hx-ticker" aria-hidden>
        <div className="hx-ticker-track">
          {[...MARKETS_TICKER, ...MARKETS_TICKER].map((s, i) => (
            <span className="hx-ticker-item" key={i}>{s}</span>
          ))}
        </div>
      </div>

      <section className="hx-stats">
        <div className="hx-stat">
          <span className="hx-stat-value">100%</span>
          <span className="hx-stat-label">{c.stats.verifiable}</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">
            {snap.winRate != null ? (
              <CountUp value={snap.winRate} format={(n) => `${Math.round(n)}%`} />
            ) : (
              'n/a'
            )}
          </span>
          <span className="hx-stat-label">{c.stats.win}</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">
            {snap.closedCount ? (
              <CountUp value={snap.closedCount} format={(n) => `${Math.round(n)}`} />
            ) : (
              'n/a'
            )}
          </span>
          <span className="hx-stat-label">{c.stats.closed}</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">0 €</span>
          <span className="hx-stat-label">{c.stats.free}</span>
        </div>
      </section>

      <section className="hx-section" id="fonctionnement">
        <span className="hx-kicker">{c.how.kicker}</span>
        <h2 className="hx-h2">{c.how.h2}</h2>
        <p className="hx-lead">{c.how.lead}</p>
        <div className="hx-cards hx-cards--3">
          {c.how.steps.map((d) => (
            <article className="hx-card" key={d.k}>
              <span className="hx-card-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hx-section hx-section--band">
        <span className="hx-kicker">{c.benefits.kicker}</span>
        <h2 className="hx-h2">{c.benefits.h2}</h2>
        <div className="hx-cards hx-cards--2">
          {c.benefits.items.map((b) => (
            <article className="hx-benefit" key={b.title}>
              <div className="hx-benefit-rule" />
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hx-section" id="marches">
        <span className="hx-kicker">{c.markets.kicker}</span>
        <h2 className="hx-h2">{c.markets.h2}</h2>
        <div className="hx-cards hx-cards--2">
          {c.markets.items.map((m) => (
            <article className="hx-market" key={m.tag}>
              <span className="hx-market-tag">{m.tag}</span>
              <h3>{m.title}</h3>
              <span className="hx-market-sub">{m.sub}</span>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
        <p className="hx-note">{c.markets.note}</p>
      </section>

      <section className="hx-section hx-section--band" id="preuve">
        <span className="hx-kicker">{c.track.kicker}</span>
        <h2 className="hx-h2">{c.track.h2}</h2>
        <p className="hx-lead">{c.track.lead}</p>
        <div className="hx-track">
          <div className="hx-track-fig">
            <span className="hx-track-label">{c.track.pnl}</span>
            <span className={`hx-track-value ${trackUp ? 'pos' : 'neg'}`}>
              {snap.accountValue > 0 ? formatUsd(snap.allTimePnl, true) : 'n/a'}
            </span>
          </div>
          <div className="hx-track-fig">
            <span className="hx-track-label">{c.track.win}</span>
            <span className="hx-track-value">
              {snap.winRate != null ? `${snap.winRate}%` : 'n/a'}
            </span>
          </div>
          <div className="hx-track-fig">
            <span className="hx-track-label">{c.track.closed}</span>
            <span className="hx-track-value">{snap.closedCount || 'n/a'}</span>
          </div>
        </div>
        <div className="hx-cta-row">
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--lg">
            {c.track.cta}
          </Link>
        </div>
      </section>

      <section className="hx-section" id="fondateurs">
        <span className="hx-kicker">{c.founders.kicker}</span>
        <h2 className="hx-h2">{c.founders.h2}</h2>
        <p className="hx-lead">{c.founders.lead}</p>
        <div className="hx-cards hx-cards--2">
          <article className="hx-founder">
            <span className="hx-founder-name">Thanh</span>
            <span className="hx-founder-role">{c.founders.thanhRole}</span>
            <p>{c.founders.thanhText}</p>
          </article>
          <article className="hx-founder">
            <span className="hx-founder-name">Annissa</span>
            <span className="hx-founder-role">{c.founders.annissaRole}</span>
            <p>{c.founders.annissaText}</p>
          </article>
        </div>
      </section>

      <section className="hx-section hx-section--band">
        <span className="hx-kicker">{c.profit.kicker}</span>
        <h2 className="hx-h2">{c.profit.h2}</h2>
        <div className="hx-cards hx-cards--3">
          {c.profit.steps.map((d) => (
            <article className="hx-card" key={d.k}>
              <span className="hx-card-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
        <div className="hx-cta-row">
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--lg">
            {c.profit.ctaTerminal}
          </Link>
          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <button
              type="button"
              className="hx-btn hx-btn--ghost hx-btn--lg"
              onClick={handlePush}
              disabled={pushLoading || pushState === 'granted'}
            >
              {pushState === 'granted'
                ? c.profit.alertsOn
                : pushLoading
                  ? c.profit.alertsEnabling
                  : c.profit.alertsGet}
            </button>
          )}
        </div>
      </section>

      <section className="hx-appband">
        <div className="hx-appband-copy">
          <h3>{c.appband.title}</h3>
          <p>{c.appband.text}</p>
        </div>
        <a className="hx-btn hx-btn--primary hx-btn--lg" href={APK_DOWNLOAD_PATH} download>
          {c.appband.btn}
        </a>
      </section>

      <section className="hx-section">
        <span className="hx-kicker">{c.faq.kicker}</span>
        <h2 className="hx-h2">{c.faq.h2}</h2>
        <div className="hx-faq">
          {c.faq.items.map((item) => (
            <details className="hx-faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="hx-footer">
        <div className="hx-footer-brand">
          <span className="hx-footer-mark">{BRAND_NAME}</span>
          <span className="hx-footer-desc">{c.footer.desc}</span>
        </div>
        <p className="hx-footer-legal">{c.footer.legal}</p>
        <p className="hx-footer-links">
          <Link to="/about">{c.footer.home}</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">{c.footer.approach}</Link>
          <span aria-hidden> · </span>
          <Link to="/verifie">{c.footer.verified}</Link>
          <span aria-hidden> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span aria-hidden> · </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="hx-footer-wallet">
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
          <span aria-hidden> · </span>
          {c.footer.wallet} {truncateWallet(TRADER_WALLET)}
        </p>
      </footer>

      <MobileAppBanner />
    </div>
  );
}
