import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileAppBanner } from '../components/MobileAppBanner';
import {
  formatLandingActivity,
  useLandingSnapshot,
  type LandingSnapshot,
} from '../hooks/useLandingSnapshot';
import { formatUsd, formatPct } from '../lib/calculations';
import { CountUp } from '../components/CountUp';
import { getPushSupport, requestPushPermission } from '../lib/push';
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

const STEPS = [
  {
    k: '01',
    title: 'Nous tradons',
    text: 'Actions et matières premières, prises en conviction, avec un risque borné sur chaque position.',
  },
  {
    k: '02',
    title: 'Tout s’affiche en direct',
    text: 'Sens, levier, entrée, stop, objectif et P&L. Lu directement on-chain, sans la moindre retouche.',
  },
  {
    k: '03',
    title: 'Vous suivez',
    text: 'Une notification à chaque mouvement. Vous décidez de copier ou non. Vous gardez le contrôle.',
  },
];

const BENEFITS = [
  {
    title: 'Transparence totale',
    text: 'Chaque position visible, les gains comme les pertes. Aucun trade caché, aucun récit arrangé.',
  },
  {
    title: 'Des signaux gratuits',
    text: 'Suivez nos trades en temps réel, sans inscription et sans abonnement.',
  },
  {
    title: 'Vérifiable on-chain',
    text: 'Recoupez chaque chiffre vous-même sur la blockchain Hyperliquid. La preuve, pas la promesse.',
  },
  {
    title: 'Alertes en temps réel',
    text: 'Soyez prévenu à l’ouverture, à l’ajustement du stop ou de l’objectif, et à la clôture.',
  },
];

const MARKETS = [
  {
    tag: '01',
    title: 'Matières premières',
    sub: 'Métaux · énergie · agricoles',
    text: 'Or, argent, cuivre, aluminium, Brent, WTI, gaz naturel, céréales. Les actifs qui font tourner l’économie réelle.',
  },
  {
    tag: '02',
    title: 'Actions d’entreprises',
    sub: 'Large caps mondiales',
    text: 'Les leaders cotés en technologie, industrie et consommation. La qualité et le momentum des entreprises qui pèsent.',
  },
];

const PROFIT_STEPS = [
  {
    k: '01',
    title: 'Ouvrez le terminal',
    text: 'Aucun compte, aucun frais. Vous voyez immédiatement nos positions en cours.',
  },
  {
    k: '02',
    title: 'Activez les alertes',
    text: 'Vous êtes prévenu à chaque ouverture, ajustement et clôture, au moment où cela se passe.',
  },
  {
    k: '03',
    title: 'Suivez nos signaux',
    text: 'À votre rythme, selon votre propre jugement. Vous restez seul maître de votre capital.',
  },
];

const FAQ = [
  {
    q: 'Que tradez-vous exactement ?',
    a: 'Uniquement des matières premières (métaux, énergie, agricoles) et des actions d’entreprises cotées. Des actifs réels, opérés en conviction.',
  },
  {
    q: 'Comment vérifier que c’est réel ?',
    a: 'Tout est exécuté sur un wallet public, lisible on-chain. Le terminal affiche exactement ce que la plateforme enregistre. Vous recoupez chaque chiffre.',
  },
  {
    q: 'C’est vraiment gratuit ?',
    a: 'Oui. Le site et le terminal sont en accès libre, sans inscription. Aucun signal vendu, aucun capital géré pour des tiers.',
  },
  {
    q: 'Puis-je suivre vos trades comme des signaux ?',
    a: 'Oui. Chaque position s’affiche en temps réel avec entrée, stop, objectif et levier, et vous pouvez activer les notifications. Vous décidez de copier ou non. THANNIS ne gère pas votre argent et ne donne aucun conseil financier.',
  },
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

function HeroTerminal({ snap }: { snap: LandingSnapshot }) {
  const up = (snap.changePct ?? 0) >= 0;
  const color = up ? '#00935f' : '#e5342a';
  const line = curveLine(snap.equity, 320, 86);
  const area =
    line && `${line} L320,86 L0,86 Z`;

  return (
    <div className="hx-app">
      <div className="hx-app-bar">
        <span className="hx-app-dots"><i /><i /><i /></span>
        <span className="hx-app-title">{BRAND_NAME} · {TERMINAL_NAME}</span>
        <span className="hx-app-live"><span className="hx-app-live-dot" /> LIVE</span>
      </div>
      <div className="hx-app-body">
        <div className="hx-app-acct">
          <span className="hx-app-acct-label">Valeur du compte</span>
          <span className="hx-app-acct-value">
            {snap.accountValue > 0 ? (
              <CountUp value={snap.accountValue} format={(n) => formatUsd(n)} />
            ) : (
              'n/a'
            )}
          </span>
          {snap.changePct != null && (
            <span className={`hx-app-acct-delta ${up ? 'pos' : 'neg'}`}>
              {up ? '▲' : '▼'} {formatPct(snap.changePct)} · perf cumulée
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
            <span>PnL all-time</span>
            <b className={snap.allTimePnl >= 0 ? 'pos' : 'neg'}>
              {snap.accountValue > 0 ? (
                <CountUp value={snap.allTimePnl} format={(n) => formatUsd(n, true)} />
              ) : (
                'n/a'
              )}
            </b>
          </div>
          <div>
            <span>Réussite</span>
            <b>
              {snap.winRate != null ? (
                <CountUp value={snap.winRate} format={(n) => `${Math.round(n)}%`} />
              ) : (
                'n/a'
              )}
            </b>
          </div>
          <div>
            <span>Positions</span>
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
            <a href="#fonctionnement">Comment ça marche</a>
            <a href="#fondateurs">Les fondateurs</a>
            <a href="#preuve">Track record</a>
          </nav>
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--sm">
            Ouvrir le terminal
          </Link>
        </div>
      </header>

      <section className="hx-hero">
        <div className="hx-hero-copy">
          <span className="hx-pill">
            <span className="hx-pill-dot" />
            Société de trading. Actions et matières premières.
          </span>
          <h1 className="hx-hero-title">
            Voyez ce que nous tradons.
            <br />
            En <span className="hx-accent">temps réel</span>.
          </h1>
          <p className="hx-hero-lead">
            {BRAND_NAME} publie chaque position au moment où elle est prise, avec son
            entrée, son stop et son objectif. Suivez nos signaux librement, activez les
            alertes, profitez avec nous. Ce n’est pas un conseil financier.
          </p>
          <div className="hx-hero-actions">
            <Link to="/app" className="hx-btn hx-btn--primary">
              Ouvrir le terminal
            </Link>
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-btn hx-btn--ghost"
            >
              Vérifier on-chain
            </a>
          </div>
          <div className="hx-hero-live">
            <span className="hx-hero-live-dot" />
            {formatLandingActivity(snap)}
          </div>
          {pushMsg && <p className="hx-push-msg">{pushMsg}</p>}
        </div>

        <div className="hx-hero-visual">
          <HeroTerminal snap={snap} />
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
          <span className="hx-stat-label">Vérifiable on-chain</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">
            {snap.winRate != null ? (
              <CountUp value={snap.winRate} format={(n) => `${Math.round(n)}%`} />
            ) : (
              'n/a'
            )}
          </span>
          <span className="hx-stat-label">Taux de réussite</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">
            {snap.closedCount ? (
              <CountUp value={snap.closedCount} format={(n) => `${Math.round(n)}`} />
            ) : (
              'n/a'
            )}
          </span>
          <span className="hx-stat-label">Trades clôturés</span>
        </div>
        <div className="hx-stat">
          <span className="hx-stat-value">0 €</span>
          <span className="hx-stat-label">Accès libre</span>
        </div>
      </section>

      <section className="hx-section" id="fonctionnement">
        <span className="hx-kicker">Comment ça marche</span>
        <h2 className="hx-h2">Trois étapes. Aucune zone d’ombre.</h2>
        <p className="hx-lead">
          Vous n’avez pas besoin de nous connaître pour commencer. Vous regardez, vous
          comprenez, vous suivez. Tout est lisible dès la première minute.
        </p>
        <div className="hx-cards hx-cards--3">
          {STEPS.map((d) => (
            <article className="hx-card" key={d.k}>
              <span className="hx-card-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hx-section hx-section--band">
        <span className="hx-kicker">Ce que vous y gagnez</span>
        <h2 className="hx-h2">Un avantage simple. La vérité.</h2>
        <div className="hx-cards hx-cards--2">
          {BENEFITS.map((b) => (
            <article className="hx-benefit" key={b.title}>
              <div className="hx-benefit-rule" />
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hx-section" id="marches">
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

      <section className="hx-section hx-section--band" id="preuve">
        <span className="hx-kicker">Track record</span>
        <h2 className="hx-h2">La performance, à découvert.</h2>
        <p className="hx-lead">
          Voici nos chiffres en direct, calculés sur l’activité réelle du wallet. Rien
          n’est sélectionné, rien n’est lissé.
        </p>
        <div className="hx-track">
          <div className="hx-track-fig">
            <span className="hx-track-label">PnL cumulé net</span>
            <span className={`hx-track-value ${trackUp ? 'pos' : 'neg'}`}>
              {snap.accountValue > 0 ? formatUsd(snap.allTimePnl, true) : 'n/a'}
            </span>
          </div>
          <div className="hx-track-fig">
            <span className="hx-track-label">Taux de réussite</span>
            <span className="hx-track-value">
              {snap.winRate != null ? `${snap.winRate}%` : 'n/a'}
            </span>
          </div>
          <div className="hx-track-fig">
            <span className="hx-track-label">Trades clôturés</span>
            <span className="hx-track-value">{snap.closedCount || 'n/a'}</span>
          </div>
        </div>
        <div className="hx-cta-row">
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--lg">
            Voir le track record complet
          </Link>
        </div>
      </section>

      <section className="hx-section" id="fondateurs">
        <span className="hx-kicker">Les fondateurs</span>
        <h2 className="hx-h2">Thanh et Annissa.</h2>
        <p className="hx-lead">
          Deux fondateurs, une conviction. Rendre le trading vérifiable. Un capital
          propre, engagé sur les marchés réels, avec l’exigence de tout rendre public.
        </p>
        <div className="hx-cards hx-cards--2">
          <article className="hx-founder">
            <span className="hx-founder-name">Thanh</span>
            <span className="hx-founder-role">Trading et exécution</span>
            <p>
              Il prend et gère chaque position affichée. Tout vient de son wallet
              Hyperliquid, lisible on-chain, sans aucune retouche.
            </p>
          </article>
          <article className="hx-founder">
            <span className="hx-founder-name">Annissa</span>
            <span className="hx-founder-role">Co-fondatrice</span>
            <p>
              Elle bâtit {BRAND_NAME} avec Thanh. La même exigence, rendre chaque trade
              public et vérifiable, sans compromis.
            </p>
          </article>
        </div>
      </section>

      <section className="hx-section hx-section--band">
        <span className="hx-kicker">Comment en profiter</span>
        <h2 className="hx-h2">Suivez. Décidez. Gardez le contrôle.</h2>
        <div className="hx-cards hx-cards--3">
          {PROFIT_STEPS.map((d) => (
            <article className="hx-card" key={d.k}>
              <span className="hx-card-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
        <div className="hx-cta-row">
          <Link to="/app" className="hx-btn hx-btn--primary hx-btn--lg">
            Entrer dans le terminal
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
                  ? 'Activation'
                  : 'Recevoir les alertes'}
            </button>
          )}
        </div>
      </section>

      <section className="hx-appband">
        <div className="hx-appband-copy">
          <h3>L'app THANNIS sur Android</h3>
          <p>Les positions et les alertes dans votre poche. Téléchargement direct, un clic.</p>
        </div>
        <a className="hx-btn hx-btn--primary hx-btn--lg" href={APK_DOWNLOAD_PATH} download>
          Télécharger l'app
        </a>
      </section>

      <section className="hx-section">
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
          <span className="hx-footer-desc">Commodities &amp; Equities · Thanh &amp; Annissa</span>
        </div>
        <p className="hx-footer-legal">
          Données on-chain uniquement. Accès libre. Aucune sollicitation, aucune
          promesse de performance, pas un conseil en investissement.
        </p>
        <p className="hx-footer-links">
          <Link to="/about">La maison</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">Notre approche</Link>
          <span aria-hidden> · </span>
          <Link to="/verifie">Vérifié</Link>
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
