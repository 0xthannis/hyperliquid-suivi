import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AssetPosition, TpSlOrder } from '../api/hyperliquid';
import { formatUsd } from '../utils/calculations';
import { BRAND_NAME } from '../constants';
import { shouldNotifyPositionEvent } from './positionNotifyDedup';

async function pushNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'trades' } : {}),
    },
    trigger: null,
  });
}

/** Nouvelle position ouverte */
export async function notifyNewPosition(coin: string, isLong: boolean) {
  if (!(await shouldNotifyPositionEvent('open', coin))) return;
  const side = isLong ? 'LONG' : 'SHORT';
  await pushNotification(
    `${BRAND_NAME} · ${coin}`,
    `Position ${side} ouverte.`
  );
}

/** Position fermée avec PnL net en $ */
export async function notifyPositionClosed(coin: string, netPnl: number) {
  if (!(await shouldNotifyPositionEvent('close', coin))) return;
  const amount = formatUsd(netPnl, true);
  const label = netPnl >= 0 ? 'Gain' : 'Perte';
  await pushNotification(
    `${BRAND_NAME} · ${coin}`,
    `Position fermée · ${label} ${amount}`
  );
}

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
