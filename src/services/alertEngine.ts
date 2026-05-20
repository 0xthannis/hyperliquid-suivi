import * as Notifications from 'expo-notifications';
import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import { formatUsd } from '../utils/calculations';

async function pushNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

/** Nouvelle position ouverte */
export async function notifyNewPosition(coin: string, isLong: boolean) {
  const sens = isLong ? "à l'achat" : 'à la vente';
  await pushNotification(
    'Neymo Trades',
    `Neymo a ouvert une position ${sens} sur ${coin}.`
  );
}

export async function notifyPositionClosed(coin: string, netPnl: number) {
  const win = netPnl >= 0;
  const resultat = win ? 'en profit' : 'en perte';
  await pushNotification(
    'Neymo Trades',
    `Neymo vient de fermer une position ${resultat}. Gain/Perte: ${formatUsd(netPnl, true)}`
  );
}

/** Pas d'alertes stop/TP — version simple */
export async function checkNearStopAlerts(
  _positions: AssetPosition[],
  _orders: TpSlOrder[],
  _mids: Record<string, number>
) {
  /* désactivé */
}

export async function scheduleDailyWeeklySummaries() {
  /* désactivé */
}

export async function notifyDailySummary(
  _todayNet?: number,
  _winRate?: number,
  _closed?: number
) {
  /* désactivé */
}
