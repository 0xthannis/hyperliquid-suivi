import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPositions } from '../api/hyperliquid';
import { STORAGE_KEY_POSITIONS } from '../constants';

export const BACKGROUND_FETCH_TASK = 'neymo-trades-position-check';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const { positions } = await fetchPositions();
    const currentCoins = positions.map((p) => p.coin);
    const stored = await AsyncStorage.getItem(STORAGE_KEY_POSITIONS);
    const previous: string[] = stored ? JSON.parse(stored) : [];
    const prevSet = new Set(previous);

    for (const p of positions) {
      if (!prevSet.has(p.coin)) {
        const sens = p.isLong ? "à l'achat" : 'à la vente';
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Neymo Trades',
            body: `Neymo a ouvert une position ${sens} sur ${p.coin}.`,
            sound: true,
          },
          trigger: null,
        });
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY_POSITIONS,
      JSON.stringify(currentCoins)
    );
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch() {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return;
  }

  const registered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK
  );
  if (!registered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 5,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
