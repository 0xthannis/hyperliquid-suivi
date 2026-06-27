import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import { useLang } from '../i18n';
import { getPagesCopy } from '../i18n/pages';
import './AboutPage.css';

export function AboutPage() {
  const [lang] = useLang();
  const p = getPagesCopy(lang);
  const c = p.about;

  return (
    <div className="about">
      <header className="about-nav">
        <Link to="/" className="about-back">
          {p.common.home}
        </Link>
        <BrandLogo compact />
        <Link to="/app" className="about-cta">
          {TERMINAL_NAME}
        </Link>
      </header>

      <main className="about-main">
        <p className="about-eyebrow">{c.eyebrow}</p>
        <h1>{BRAND_NAME}</h1>
        <p className="about-lead">
          {c.leadPre}
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
          {c.leadPost}
        </p>

        <section className="about-block">
          <h2>{c.foundersTitle}</h2>
          <div className="about-people">
            <article>
              <h3>Thanh</h3>
              <p className="about-role">{c.thanhRole}</p>
              <p>{c.thanhText}</p>
            </article>
            <article>
              <h3>Annissa</h3>
              <p className="about-role">{c.annissaRole}</p>
              <p>{c.annissaText}</p>
            </article>
          </div>
        </section>

        <section className="about-block">
          <h2>{c.convictionTitle}</h2>
          <p>{c.convictionText}</p>
        </section>

        <section className="about-block">
          <h2>{c.offerTitle}</h2>
          <ul className="about-list">
            {c.offer.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        </section>

        <section className="about-block">
          <h2>{c.notTitle}</h2>
          <ul className="about-list about-list--muted">
            {c.not.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        </section>

        <section className="about-block about-contact">
          <h2>{c.contactTitle}</h2>
          <p>
            {c.walletLine}{' '}
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              {truncateWallet(TRADER_WALLET)}
            </a>{' '}
            {c.walletVerify}
          </p>
          <p>
            {c.emailLine}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="about-link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <div className="about-footer-links">
          <Link to="/methodology">{p.common.approach}</Link>
          <span> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
        </div>
      </main>
    </div>
  );
}
