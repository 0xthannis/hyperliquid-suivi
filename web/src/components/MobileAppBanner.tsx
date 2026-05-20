import { useState } from 'react';
import {
  APK_DOWNLOAD_URL,
  ANDROID_PACKAGE,
  SITE_URL,
} from '../constants';
import './MobileAppBanner.css';

const APP_SCHEME_URL = 'atcapital://app';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/** Intent Android : ouvre l'app si installée, sinon peut échouer silencieusement */
function androidIntentUrl(): string {
  return `intent://${new URL(SITE_URL).host}/app#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(APK_DOWNLOAD_URL)};end`;
}

export function MobileAppBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (!isMobileDevice() || dismissed) return null;

  function openApp() {
    if (isAndroid()) {
      window.location.href = androidIntentUrl();
      return;
    }
    window.location.href = APP_SCHEME_URL;
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.href = APK_DOWNLOAD_URL;
      }
    }, 1500);
  }

  function installApk() {
    window.location.href = APK_DOWNLOAD_URL;
  }

  return (
    <div className="mobile-app-banner" role="region" aria-label="Application mobile">
      <div className="mobile-app-banner-inner">
        <p className="mobile-app-banner-title">Terminal 277 sur mobile</p>
        <p className="mobile-app-banner-text">
          Ouvrez l'app A&amp;T CAPITAL si elle est installée, ou téléchargez la dernière APK.
        </p>
        <div className="mobile-app-banner-actions">
          <button type="button" className="mobile-app-btn mobile-app-btn--primary" onClick={openApp}>
            Ouvrir l'app
          </button>
          <button type="button" className="mobile-app-btn" onClick={installApk}>
            Installer l'APK
          </button>
          <a href={SITE_URL} className="mobile-app-link">
            Continuer sur le site
          </a>
        </div>
      </div>
      <button
        type="button"
        className="mobile-app-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
