import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFills, fetchPositions } from '../api/hyperliquid';
import {
  STORAGE_KEY_POSITIONS,
  STORAGE_KEY_REMOTE_PUSH,
  POLL_BACKUP_MS,
} from '../constants';
import { computeNetPnlFromFill } from '../utils/calculations';
import { notifyNewPosition, notifyPositionClosed } from './alertEngine';
import { markPositionsAsKnown } from './positionNotifyDedup';

const WATCH_NOTIFICATION_ID = 'at-capital-watch-service';
const INIT_KEY = '@at_capital_monitor_init';

let pollTimer: ReturnType<typeof setInterval> | null = null;
let running = false;

async function usesRemotePushOnly(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEY_REMOTE_PUSH)) === '1';
}

/** Garde le processus actif sur Android (notification persistante discrète). */
export async function setAndroidWatchMode(enabled: boolean) {
  if (Platform.OS !== 'android') return;

  if (enabled) {
    await Notifications.setNotificationChannelAsync('watch', {
      name: 'Surveillance Terminal 277',
      importance: Notifications.AndroidImportance.LOW,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.scheduleNotificationAsync({
      identifier: WATCH_NOTIFICATION_ID,
      content: {
        title: 'Terminal 277 · Surveillance active',
        body: 'Alertes ouverture et fermeture des positions Hyperliquid',
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW,
        autoDismiss: false,
        ...(Platform.OS === 'android' ? { channelId: 'watch' } : {}),
      },
      trigger: null,
    });
  } else {
    await Notifications.dismissNotificationAsync(WATCH_NOTIFICATION_ID).catch(
      () => {}
    );
  }
}

/**
 * Compare le wallet HL au dernier état connu et envoie les notifs si besoin.
 */
export async function runPositionMonitor(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const [{ positions }, fills] = await Promise.all([
      fetchPositions(),
      fetchFills(),
    ]);

    const currentCoins = positions.map((p) => p.coin);
    const storedRaw = await AsyncStorage.getItem(STORAGE_KEY_POSITIONS);
    const previous: string[] = storedRaw ? JSON.parse(storedRaw) : [];
    const initialized = await AsyncStorage.getItem(INIT_KEY);
    const remoteOnly = await usesRemotePushOnly();

    // Premier lancement ou stockage vide : baseline sans spam
    if (!initialized || (previous.length === 0 && currentCoins.length > 0)) {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_POSITIONS, JSON.stringify(currentCoins)],
        [INIT_KEY, '1'],
      ]);
      await markPositionsAsKnown(currentCoins);
      return;
    }

    const prevSet = new Set(previous);
    const skipLocalNotify = remoteOnly;

    for (const p of positions) {
      if (!prevSet.has(p.coin) && !skipLocalNotify) {
        await notifyNewPosition(p.coin, p.isLong);
      }
    }

    const currentSet = new Set(currentCoins);
    for (const coin of previous) {
      if (!currentSet.has(coin) && !skipLocalNotify) {
        const closeFill = fills
          .filter((f) => f.coin === coin && f.dir.includes('Close'))
          .sort((a, b) => b.time - a.time)[0];
        const net = closeFill
          ? computeNetPnlFromFill(closeFill.closedPnl, closeFill.fee)
          : 0;
        await notifyPositionClosed(coin, net);
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY_POSITIONS,
      JSON.stringify(currentCoins)
    );
  } finally {
    running = false;
  }
}

export function startGlobalPositionMonitoring() {
  if (pollTimer) return;
  void runPositionMonitor();
  pollTimer = setInterval(() => void runPositionMonitor(), POLL_BACKUP_MS);
}

export function stopGlobalPositionMonitoring() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export async function onAppStateChange(state: string) {
  if (Platform.OS === 'android') {
    await setAndroidWatchMode(state !== 'active');
  }
}
