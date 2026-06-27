export const TRADER_WALLET =
  import.meta.env.VITE_TRADER_WALLET ??
  '0x5372140d358Dda770690a734798aaa37958Fb927';

export const API_URL = 'https://api.hyperliquid.xyz/info';
export const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export const POLL_BACKUP_MS = 30_000;
export const MIDS_POLL_MS = 2_000;
export const BRAND_NAME = 'THANNIS';
export const TERMINAL_NAME = 'Terminal';
export const APP_NAME = BRAND_NAME;
export const SITE_URL = 'https://thannis.com';
export const CONTACT_EMAIL = 'contact@thannis.com';
export const APK_DOWNLOAD_URL = `${SITE_URL}/Thannis.apk`;
export const ANDROID_PACKAGE = 'com.thanh.suivitrades';

export const DATA_SCOPE =
  'Périmètre : wallet Hyperliquid uniquement · historique limité à l\'activité enregistrée sur HL';

export const API_SOURCE_LABEL = 'Source : API Hyperliquid (info)';

export function hyperliquidExplorerUrl(wallet: string): string {
  return `https://app.hyperliquid.xyz/explorer/address/${wallet}`;
}
