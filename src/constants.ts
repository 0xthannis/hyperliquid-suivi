export const TRADER_WALLET = '0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F';

export const API_URL = 'https://api.hyperliquid.xyz/info';
export const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export const POLL_BACKUP_MS = 30_000;
export const MIDS_POLL_MS = 2_000;

export const STORAGE_KEY_POSITIONS = '@suivi_thanh_positions';
export const STORAGE_KEY_NEAR_STOP_ALERTED = '@suivi_thanh_near_stop';
export const STORAGE_KEY_WIDGET = '@suivi_thanh_widget';
export const STORAGE_KEY_LAST_FILL = '@suivi_thanh_last_fill';
export const STORAGE_KEY_NOTIFIED_FILLS = '@at_capital_notified_fills';
export const STORAGE_KEY_SUMMARY_DAY = '@suivi_thanh_summary_day';
export const STORAGE_KEY_PUSH_TOKEN = '@at_capital_push_token';
export const STORAGE_KEY_POSITION_EVENTS = '@at_capital_position_events';
export const STORAGE_KEY_REMOTE_PUSH = '@at_capital_remote_push_active';

export const NEAR_STOP_THRESHOLD = 0.22;
export const NEAR_TP_THRESHOLD = 0.15;

export const BRAND_NAME = 'A&T CAPITAL';
export const TERMINAL_NAME = 'Terminal 277';
export const APP_NAME = BRAND_NAME;
export const SITE_URL = 'https://atcapital.up.railway.app';
/** API push Railway (surveillance wallet 24/7) */
export const PUSH_API_BASE = SITE_URL;
export const CONTACT_EMAIL = 'contact@atcapital.fr';
export const APK_DOWNLOAD_URL = `${SITE_URL}/AT-Capital-Terminal-277.apk`;
export const ANDROID_PACKAGE = 'com.thanh.suivitrades';

export const DATA_SCOPE =
  'Wallet Hyperliquid uniquement · historique limité à l\'activité HL';

export function hyperliquidExplorerUrl(wallet: string): string {
  return `https://app.hyperliquid.xyz/explorer/address/${wallet}`;
}
