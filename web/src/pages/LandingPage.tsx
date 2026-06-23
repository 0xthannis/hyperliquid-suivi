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

const TICKER = [
  { sym: 'OR', cat: 'Métaux précieux' },
  { sym: 'ARGENT', cat: 'Métaux précieux' },
  { sym: 'CUIVRE', cat: 'Métaux' },
  { sym: 'ALUMINIUM', cat: 'Métaux' },
  { sym: 'BRENT', cat: 'Énergie' },
  { sym: 'WTI', cat: 'Énergie' },
  { sym: 'GAZ NAT.', cat: 'Énergie' },
  { sym: 'BLÉ', cat: 'Agricole' },
  { sym: 'AAPL', cat: 'Actions' },
  { sym: 'NVDA', cat: 'Actions' },
  { sym: 'MSFT', cat: 'Actions' },
  { sym: 'TSLA', cat: 'Actions' },
  { sym: 'AMZN', cat: 'Actions' },
  { sym: 'MRVL', cat: 'Actions' },
];

const STATS = [
  { value: '100%', label: 'On-chain · vérifiable' },
  { value: '2', label: 'Marchés · matières premières & actions' },
  { value: '0 €', label: 'Terminal en accès libre' },
  { value: 'Live', label: 'Exécution en temps réel' },
];

const DOCTRINE = [
  {
    k: 'I',
    title: 'Conviction',
    text: "Peu de positions, prises avec intention. On n'entre pas pour suivre le bruit — on entre quand la thèse est claire et le risque borné.",
  },
  {
    k: 'II',
    title: 'Discipline',
    text: 'Chaque ligne a son stop et son objectif définis avant l’exécution. Le process passe avant le résultat, toujours.',
  },
  {
    k: 'III',
    title: 'Transparence',
    text: 'Tout est lisible on-chain, en temps réel. Les mêmes chiffres que nous, pour tout le monde — sans filtre, sans promesse.',
  },
];

const MARKETS = [
  {
    tag: '01',
    title: 'Matières premières',
    sub: 'Métaux · énergie · agricoles',
    text: "Or, argent, cuivre, aluminium, Brent, WTI, gaz naturel, céréales. Les actifs réels qui font tourner l’économie mondiale, opérés avec un mandat de risque strict.",
  },
  {
    tag: '02',
    title: 'Actions d’entreprises',
    sub: 'Large caps mondiales',
    text: "Les leaders cotés — technologie, industrie, consommation. On suit la qualité et le momentum des entreprises qui pèsent, pas les modes.",
  },
];

const TERMINAL_FEATURES = [
  {
    title: 'Positions en direct',
    text: 'Sens, levier, prix d’entrée, stop, take-profit et PnL non réalisé — actualisés en continu.',
  },
  {
    title: 'Journal vérifiable',
    text: 'Chaque opération clôturée, avec son résultat enregistré on-chain. Export possible.',
  },
  {
    title: 'Alertes discrètes',
    text: 'Une notification à l’ouverture d’une position, si vous le souhaitez. Rien d’imposé.',
  },
];

const FAQ = [
  {
    q: 'Que tradez-vous, exactement ?',
    a: 'Uniquement des matières premières (métaux, énergie, agricoles) et des actions d’entreprises cotées. Pas de crypto à l’avant — des actifs réels, opérés en conviction.',
  },
  {
    q: 'Comment puis-je vérifier que c’est réel ?',
    a: 'Tout est exécuté sur un wallet public et lisible on-chain. Le Terminal 277 affiche exactement ce que la plateforme enregistre — vous pouvez recouper chaque chiffre.',
  },
  {
    q: 'C’est payant ?',
    a: 'Non. Le site et le Terminal 277 sont en accès libre, sans inscription ni paiement. Aucun signal vendu, aucun capital géré pour des tiers.',
  },
  {
    q: 'Puis-je répliquer vos positions ?',
    a: 'Vous observez et décidez par vous-même. A&T CAPITAL ne vous demande rien et ne gère pas de compte pour vous. Vous restez seul responsable de vos choix.',
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
    <div className="lx">
      <header className="lx-nav">
        <div className="lx-nav-inner">
          <Link to="/" className="lx-wordmark">
            <span className="lx-wordmark-name">{BRAND_NAME}</span>
            <span className="lx-wordmark-desc">Commodities &amp; Equities</span>
          </Link>
          <nav className="lx-nav-links" aria-label="Navigation">
            <a href="#maison">La maison</a>
            <a href="#marches">Marchés</a>
            <a href="#terminal">Terminal</a>
          </nav>
          <Link to="/app" className="lx-nav-cta">
            Ouvrir le Terminal
          </Link>
        </div>
      </header>

      <div className="lx-ticker" aria-hidden>
        <div className="lx-ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="lx-ticker-item" key={i}>
              <span className="lx-ticker-sym">{t.sym}</span>
              <span className="lx-ticker-cat">{t.cat}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="lx-hero">
        <p className="lx-eyebrow">Maison de trading privée</p>
        <h1 className="lx-hero-title">
          Matières premières &amp; actions,
          <br />
          <em>tradées en conviction.</em>
        </h1>
        <p className="lx-hero-lead">
          {BRAND_NAME} opère les marchés réels — métaux, énergie, agricoles et
          actions d’entreprises mondiales. Capital propre, exécution réelle, chaque
          position lisible on-chain. Pas de gestion pour tiers, pas de promesse :
          la donnée parle d’elle-même.
        </p>

        <div className="lx-hero-actions">
          <Link to="/app" className="lx-btn lx-btn--primary">
            Ouvrir le Terminal 277
          </Link>
          <a
            href={hyperliquidExplorerUrl(TRADER_WALLET)}
            target="_blank"
            rel="noopener noreferrer"
            className="lx-btn lx-btn--ghost"
          >
            Vérifier on-chain
          </a>
        </div>

        <div className="lx-hero-live" aria-live="polite">
          <span className="lx-hero-live-dot" />
          <span>{formatLandingActivity(snapshot)}</span>
        </div>
        {pushMsg && <p className="lx-push-msg">{pushMsg}</p>}
      </section>

      <section className="lx-stats">
        {STATS.map((s) => (
          <div className="lx-stat" key={s.label}>
            <span className="lx-stat-value">{s.value}</span>
            <span className="lx-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="lx-section" id="maison">
        <div className="lx-section-head">
          <span className="lx-kicker">La maison</span>
          <h2 className="lx-h2">
            Un capital opéré par deux, avec la rigueur d’une institution.
          </h2>
        </div>
        <p className="lx-section-lead">
          {BRAND_NAME} est une structure privée tenue par <strong>Annissa</strong>{' '}
          et <strong>Thanh</strong>. Deux personnes, un mandat clair : faire
          travailler un capital propre sur les marchés réels, avec la discipline
          d’une salle des marchés et l’exigence de tout rendre vérifiable. Aucune
          levée auprès de tiers, aucun client à servir — seulement la performance,
          exposée au grand jour.
        </p>

        <div className="lx-doctrine">
          {DOCTRINE.map((d) => (
            <article className="lx-doctrine-card" key={d.k}>
              <span className="lx-doctrine-num">{d.k}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lx-section lx-section--alt" id="marches">
        <div className="lx-section-head">
          <span className="lx-kicker">Univers d’investissement</span>
          <h2 className="lx-h2">Deux marchés. Des actifs réels. Pas de bruit.</h2>
        </div>

        <div className="lx-markets">
          {MARKETS.map((m) => (
            <article className="lx-market" key={m.tag}>
              <span className="lx-market-tag">{m.tag}</span>
              <h3 className="lx-market-title">{m.title}</h3>
              <p className="lx-market-sub">{m.sub}</p>
              <p className="lx-market-text">{m.text}</p>
            </article>
          ))}
        </div>
        <p className="lx-market-note">
          Pas de crypto à l’avant. Pas de tokens à la mode. Des matières premières
          et des entreprises que l’on comprend.
        </p>
      </section>

      <section className="lx-section" id="terminal">
        <div className="lx-section-head">
          <span className="lx-kicker">{TERMINAL_NAME}</span>
          <h2 className="lx-h2">
            La salle des marchés, ouverte à tous — en lecture seule.
          </h2>
        </div>
        <p className="lx-section-lead">
          Le {TERMINAL_NAME} est notre tableau de bord public. Vous y voyez les
          mêmes positions que nous, en temps réel, branchées directement sur la
          plateforme d’exécution. Aucun compte, aucun frais.
        </p>

        <div className="lx-features">
          {TERMINAL_FEATURES.map((f) => (
            <article className="lx-feature" key={f.title}>
              <div className="lx-feature-rule" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>

        <div className="lx-terminal-cta">
          <Link to="/app" className="lx-btn lx-btn--primary lx-btn--lg">
            Entrer dans le Terminal
          </Link>
          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <button
              type="button"
              className="lx-btn lx-btn--ghost lx-btn--lg"
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

      <section className="lx-section lx-section--alt">
        <div className="lx-section-head">
          <span className="lx-kicker">Questions fréquentes</span>
          <h2 className="lx-h2">Ce qu’il faut savoir avant d’entrer.</h2>
        </div>
        <div className="lx-faq">
          {FAQ.map((item) => (
            <details className="lx-faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="lx-footer">
        <div className="lx-footer-top">
          <span className="lx-footer-mark">{BRAND_NAME}</span>
          <span className="lx-footer-desc">Commodities &amp; Equities · Annissa &amp; Thanh</span>
        </div>
        <p className="lx-footer-legal">
          Données on-chain uniquement · Accès libre · Aucune sollicitation, aucune
          promesse de performance, pas un conseil en investissement.
        </p>
        <p className="lx-footer-links">
          <Link to="/about">La maison</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">Méthodologie</Link>
          <span aria-hidden> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span aria-hidden> · </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="lx-footer-wallet">
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
          <span aria-hidden> · </span>
          Wallet {truncateWallet(TRADER_WALLET)}
        </p>
      </footer>

      <MobileAppBanner />
    </div>
  );
}
