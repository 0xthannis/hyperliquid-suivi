import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_WIDGET } from '../constants';

export type WidgetSnapshot = {
  accountValue: number;
  openPnl: number;
  openCount: number;
  todayNetPnl: number;
  updatedAt: number;
};

export async function saveWidgetSnapshot(data: WidgetSnapshot) {
  await AsyncStorage.setItem(STORAGE_KEY_WIDGET, JSON.stringify(data));
}

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_WIDGET);
  return raw ? JSON.parse(raw) : null;
}
