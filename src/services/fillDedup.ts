import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_NOTIFIED_FILLS } from '../constants';

const MAX_KEYS = 300;

export async function shouldNotifyFill(fillKey: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_NOTIFIED_FILLS);
  const seen: string[] = raw ? JSON.parse(raw) : [];
  if (seen.includes(fillKey)) return false;
  const next = [fillKey, ...seen].slice(0, MAX_KEYS);
  await AsyncStorage.setItem(STORAGE_KEY_NOTIFIED_FILLS, JSON.stringify(next));
  return true;
}

export function fillKey(coin: string, time: number, dir: string): string {
  return `${coin}-${time}-${dir}`;
}
