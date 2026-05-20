import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { WidgetSnapshot } from './widgetStore';
import { formatUsd } from '../utils/calculations';
import { isAppInForeground } from './appForeground';

export const LIVE_NOTIFICATION_ID = 'suivi-thanh-live-ticker';

/** Notification persistante — uniquement quand l'app est en arrière-plan */
export async function updateLiveNotification(data: WidgetSnapshot | null) {
  if (Platform.OS !== 'android' || !data || isAppInForeground()) return;

  const pos = data.openPnl >= 0;

  await Notifications.dismissNotificationAsync(LIVE_NOTIFICATION_ID).catch(
    () => {}
  );

  await Notifications.scheduleNotificationAsync({
    identifier: LIVE_NOTIFICATION_ID,
    content: {
      title: 'Neymo Trades',
      body: `${data.openCount} pos. · ${formatUsd(data.openPnl, true)} · Jour ${formatUsd(data.todayNetPnl, true)}`,
      sticky: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
      autoDismiss: false,
    },
    trigger: null,
  });
}

export async function clearLiveNotification() {
  await Notifications.dismissNotificationAsync(LIVE_NOTIFICATION_ID).catch(
    () => {}
  );
}
