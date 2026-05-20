export const TRADER_WALLET =
  import.meta.env.VITE_TRADER_WALLET ??
  '0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F';

export const API_URL = 'https://api.hyperliquid.xyz/info';
export const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export const POLL_BACKUP_MS = 30_000;
export const MIDS_POLL_MS = 2_000;
export const BRAND_NAME = 'A&T CAPITAL';
export const TERMINAL_NAME = 'Terminal 277';
export const APP_NAME = BRAND_NAME;
export const SITE_URL = 'https://atcapital.up.railway.app';
export const CONTACT_EMAIL = 'contact@atcapital.fr';
export const APK_DOWNLOAD_URL = `${SITE_URL}/AT-Capital-Terminal-277.apk`;
export const ANDROID_PACKAGE = 'com.thanh.suivitrades';

export const DATA_SCOPE =
  'Périmètre : wallet Hyperliquid uniquement · historique limité à l\'activité enregistrée sur HL';

export const API_SOURCE_LABEL = 'Source : API Hyperliquid (info)';

export function hyperliquidExplorerUrl(wallet: string): string {
  return `https://app.hyperliquid.xyz/explorer/address/${wallet}`;
}
