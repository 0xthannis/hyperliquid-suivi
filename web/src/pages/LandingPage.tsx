import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppBanner } from '../components/MobileAppBanner';
import {
  formatLandingActivity,
  useLandingSnapshot,
} from '../hooks/useLandingSnapshot';
import { getPushSupport, requestPushPermission } from '../lib/push';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './LandingPage.css';

const MARKETS_TICKER = [
  'OR', 'ARGENT', 'CUIVRE', 'ALUMINIUM', 'BRENT', 'WTI', 'GAZ NAT.',
  'BLÉ', 'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'MRVL', 'MU', 'AMD',
];

const STATS = [
  { value: '100%', label: 'Vérifiable on-chain' },
  { value: '2', label: 'Classes d’actifs réels' },
  { value: '0 €', label: 'Terminal en accès libre' },
  { value: '24/7', label: 'Exécution & suivi' },
];

const DOCTRINE = [
  {
    k: '01',
    title: 'Conviction',
    text: 'Peu de lignes, prises avec intention. On entre quand la thèse est nette et le risque borné. Jamais pour suivre le bruit.',
  },
  {
    k: '02',
    title: 'Discipline',
    text: 'Stop et objectif définis avant chaque exécution. Le process commande, le résultat suit. Aucune position laissée au hasard.',
  },
  {
    k: '03',
    title: 'Transparence',
    text: 'Tout est inscrit on-chain, en temps réel. Les mêmes chiffres que nous, pour tous, sans filtre ni récit arrangé.',
  },
];

const MARKETS = [
  {
    tag: '01',
    title: 'Matières premières',
    sub: 'Métaux · énergie · agricoles',
    text: 'Or, argent, cuivre, aluminium, Brent, WTI, gaz naturel, céréales. Les actifs qui font tourner l’économie réelle, opérés sous mandat de risque strict.',
  },
  {
    tag: '02',
    title: 'Actions d’entreprises',
    sub: 'Large caps mondiales',
    text: 'Les leaders cotés en technologie, industrie et consommation. On suit la qualité et le momentum des entreprises qui pèsent, pas les modes.',
  },
];

const TERMINAL_FEATURES = [
  {
    title: 'Positions en direct',
    text: 'Sens, levier, entrée, stop, take-profit et PnL non réalisé, actualisés en continu depuis la plateforme d’exécution.',
  },
  {
    title: 'Journal vérifiable',
    text: 'Chaque opération clôturée avec son résultat enregistré on-chain. Recoupable, exportable, sans retouche.',
  },
  {
    title: 'Alertes silencieuses',
    text: 'Une notification à l’ouverture d’une position, si vous le souhaitez. Discret par défaut.',
  },
];

const FAQ = [
  {
    q: 'Que tradez-vous exactement ?',
    a: 'Uniquement des matières premières (métaux, énergie, agricoles) et des actions d’entreprises cotées. Des actifs réels, opérés en conviction. Pas de bruit.',
  },
  {
    q: 'Comment vérifier que c’est réel ?',
    a: 'Tout est exécuté sur un wallet public, lisible on-chain. Le Terminal affiche exactement ce que la plateforme enregistre : vous recoupez chaque chiffre.',
  },
  {
    q: 'C’est payant ?',
    a: 'Non. Le site et le Terminal sont en accès libre, sans inscription. Aucun signal vendu, aucun capital géré pour des tiers.',
  },
  {
    q: 'Puis-je suivre vos trades comme des signaux ?',
    a: 'Oui. Chaque position s’affiche en temps réel avec entrée, stop, take-profit et levier, et vous pouvez activer les notifications. Vous décidez de copier ou non — THANNIS ne gère pas votre argent et ne donne aucun conseil financier.',
  },
];

export function LandingPage() {
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const pushState = getPushSupport();
  const snapshot = useLandingSnapshot();

  async function handlePush() {
    setPushLoading(true);
    setPushMsg(null);
    const result = await requestPushPermission();
    setPushMsg(result.message);
    setPushLoading(false);
  }

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
            <a href="#maison">La maison</a>
            <a href="#marches">Marchés</a>
            <a href="#terminal">Terminal</a>
          </nav>
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--sm">
            Ouvrir le Terminal
          </Link>
        </div>
      </header>

      <section className="hx-hero">
        <div className="hx-hero-copy">
          <span className="hx-pill">
            <span className="hx-pill-dot" />
            Société de trading · Actions &amp; matières premières
          </span>
          <h1 className="hx-hero-title">
            Nos positions, publiques
            <br />
            et en <span className="hx-accent">temps réel</span>.
          </h1>
          <p className="hx-hero-lead">
            {BRAND_NAME} est une société de trading spécialisée dans les actions et
            les matières premières, fondée par un couple, Thanh &amp; Annissa. Chaque
            position est publique, transparente et accessible en temps réel, avec les
            notifications, pour les suivre comme des signaux et profiter avec nous.
            Ce n’est pas un conseil financier.
          </p>
          <div className="hx-hero-actions">
            <Link to="/app" className="hx-btn hx-btn--primary">
              Ouvrir le Terminal
            </Link>
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-btn hx-btn--ghost"
            >
              Vérifier on-chain →
            </a>
          </div>
          <div className="hx-hero-live">
            <span className="hx-hero-live-dot" />
            {formatLandingActivity(snapshot)}
          </div>
          {pushMsg && <p className="hx-push-msg">{pushMsg}</p>}
        </div>

        <div className="hx-hero-visual" aria-hidden>
          <div className="hx-app">
            <div className="hx-app-bar">
              <span className="hx-app-dots">
                <i /><i /><i />
              </span>
              <span className="hx-app-title">{BRAND_NAME} · {TERMINAL_NAME}</span>
              <span className="hx-app-live">
                <span className="hx-app-live-dot" /> LIVE
              </span>
            </div>
            <div className="hx-app-body">
              <div className="hx-app-acct">
                <span className="hx-app-acct-label">Valeur du compte</span>
                <span className="hx-app-acct-value">$478.48</span>
                <span className="hx-app-acct-delta">▲ 1.93% · 30J</span>
              </div>
              <svg className="hx-curve" viewBox="0 0 320 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="hxfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16d195" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#16d195" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,62 L26,58 L52,63 L78,49 L104,53 L130,40 L156,44 L182,31 L208,35 L234,24 L260,28 L286,16 L320,12 L320,80 L0,80 Z"
                  fill="url(#hxfill)"
                />
                <path
                  d="M0,62 L26,58 L52,63 L78,49 L104,53 L130,40 L156,44 L182,31 L208,35 L234,24 L260,28 L286,16 L320,12"
                  fill="none"
                  stroke="#16d195"
                  strokeWidth="1.5"
                />
              </svg>
              <div className="hx-app-kpis">
                <div><span>PnL all-time</span><b className="pos">+$1,284</b></div>
                <div><span>Win rate</span><b>61%</b></div>
                <div><span>Exposition</span><b>$2,370</b></div>
              </div>
              <div className="hx-app-table">
                <div className="hx-app-row hx-app-row--head">
                  <span>Marché</span><span>Sens</span><span>Lev</span><span className="r">PnL</span>
                </div>
                <div className="hx-app-row">
                  <span className="hx-app-sym">MRVL</span>
                  <span className="neg">SHORT</span><span>3×</span>
                  <span className="r pos">+$9.06</span>
                </div>
                <div className="hx-app-row">
                  <span className="hx-app-sym">GOLD</span>
                  <span className="pos">LONG</span><span>5×</span>
                  <span className="r pos">+$41.20</span>
                </div>
                <div className="hx-app-row">
                  <span className="hx-app-sym">BRENT</span>
                  <span className="neg">SHORT</span><span>4×</span>
                  <span className="r neg">−$12.40</span>
                </div>
              </div>
            </div>
          </div>
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
        {STATS.map((s) => (
          <div className="hx-stat" key={s.label}>
            <span className="hx-stat-value">{s.value}</span>
            <span className="hx-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="hx-section" id="maison">
        <span className="hx-kicker">La maison</span>
        <h2 className="hx-h2">Un capital opéré par deux.<br />La rigueur d’une institution.</h2>
        <p className="hx-lead">
          {BRAND_NAME} est une structure privée fondée par <strong>Annissa</strong>{' '}
          et <strong>Thanh</strong>. Aucune levée auprès de tiers, aucun client à
          servir : un capital propre, engagé sur les marchés réels, avec la
          discipline d’une salle des marchés et l’exigence de tout rendre vérifiable.
        </p>
        <div className="hx-cards hx-cards--3">
          {DOCTRINE.map((d) => (
            <article className="hx-card" key={d.k}>
              <span className="hx-card-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hx-section hx-section--band" id="marches">
        <span className="hx-kicker">Univers d’investissement</span>
        <h2 className="hx-h2">Deux classes d’actifs réels.</h2>
        <div className="hx-cards hx-cards--2">
          {MARKETS.map((m) => (
            <article className="hx-market" key={m.tag}>
              <span className="hx-market-tag">{m.tag}</span>
              <h3>{m.title}</h3>
              <span className="hx-market-sub">{m.sub}</span>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
        <p className="hx-note">Pas de crypto à l’avant. Pas de tokens à la mode. Des actifs que l’on comprend.</p>
      </section>

      <section className="hx-section" id="terminal">
        <span className="hx-kicker">{TERMINAL_NAME}</span>
        <h2 className="hx-h2">La salle des marchés, ouverte à tous.</h2>
        <p className="hx-lead">
          Le {TERMINAL_NAME} est notre table de lecture publique : les mêmes
          positions que nous, en temps réel, branchées sur la plateforme
          d’exécution. Aucun compte, aucun frais.
        </p>
        <div className="hx-features">
          {TERMINAL_FEATURES.map((f) => (
            <article className="hx-feature" key={f.title}>
              <div className="hx-feature-rule" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
        <div className="hx-cta-row">
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--lg">
            Entrer dans le Terminal
          </Link>
          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <button
              type="button"
              className="hx-btn hx-btn--ghost hx-btn--lg"
              onClick={handlePush}
              disabled={pushLoading || pushState === 'granted'}
            >
              {pushState === 'granted'
                ? 'Alertes activées'
                : pushLoading
                  ? 'Activation…'
                  : 'Recevoir les alertes'}
            </button>
          )}
        </div>
      </section>

      <section className="hx-section hx-section--band">
        <span className="hx-kicker">Questions fréquentes</span>
        <h2 className="hx-h2">Avant d’entrer.</h2>
        <div className="hx-faq">
          {FAQ.map((item) => (
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
          <span className="hx-footer-desc">Commodities &amp; Equities · Annissa &amp; Thanh</span>
        </div>
        <p className="hx-footer-legal">
          Données on-chain uniquement · Accès libre · Aucune sollicitation, aucune
          promesse de performance, pas un conseil en investissement.
        </p>
        <p className="hx-footer-links">
          <Link to="/about">La maison</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">Notre approche</Link>
          <span aria-hidden> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span aria-hidden> · </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="hx-footer-wallet">
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
          <span aria-hidden> · </span>
          Wallet {truncateWallet(TRADER_WALLET)}
        </p>
      </footer>

      <MobileAppBanner />
    </div>
  );
}
