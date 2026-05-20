export const TRADER_WALLET = '0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F';

export const API_URL = 'https://api.hyperliquid.xyz/info';
export const WS_URL = 'wss://api.hyperliquid.xyz/ws';

/** Sync complète positions / historique */
export const POLL_BACKUP_MS = 30_000;

/** Prix live via REST si WebSocket coupe (léger, sans spinner) */
export const MIDS_POLL_MS = 2_000;

export const STORAGE_KEY_POSITIONS = '@suivi_thanh_positions';
export const STORAGE_KEY_NEAR_STOP_ALERTED = '@suivi_thanh_near_stop';
export const STORAGE_KEY_WIDGET = '@suivi_thanh_widget';
export const STORAGE_KEY_LAST_FILL = '@suivi_thanh_last_fill';
export const STORAGE_KEY_SUMMARY_DAY = '@suivi_thanh_summary_day';

export const NEAR_STOP_THRESHOLD = 0.22;
export const NEAR_TP_THRESHOLD = 0.15;

export const APP_NAME = 'Neymo Trades';
