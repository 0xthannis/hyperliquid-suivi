import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_LAST_FILL } from '../constants';

export async function shouldNotifyFill(fillKey: string): Promise<boolean> {
  const last = await AsyncStorage.getItem(STORAGE_KEY_LAST_FILL);
  if (last === fillKey) return false;
  await AsyncStorage.setItem(STORAGE_KEY_LAST_FILL, fillKey);
  return true;
}

export function fillKey(coin: string, time: number, dir: string): string {
  return `${coin}-${time}-${dir}`;
}
