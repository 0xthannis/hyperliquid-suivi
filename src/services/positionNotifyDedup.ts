import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_POSITION_EVENTS } from '../constants';

type EventMap = Record<string, number>;

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function eventKey(type: 'open' | 'close', coin: string): string {
  return `${type}:${coin}`;
}

async function loadMap(): Promise<EventMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_POSITION_EVENTS);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as EventMap;
  } catch {
    return {};
  }
}

async function saveMap(map: EventMap): Promise<void> {
  const now = Date.now();
  const pruned: EventMap = {};
  for (const [k, ts] of Object.entries(map)) {
    if (now - ts < TTL_MS) pruned[k] = ts;
  }
  await AsyncStorage.setItem(STORAGE_KEY_POSITION_EVENTS, JSON.stringify(pruned));
}

/** Évite les doublons open/close (persistant après redémarrage). */
export async function shouldNotifyPositionEvent(
  type: 'open' | 'close',
  coin: string
): Promise<boolean> {
  const map = await loadMap();
  const key = eventKey(type, coin);
  const last = map[key];
  if (last != null && Date.now() - last < TTL_MS) return false;

  map[key] = Date.now();
  if (type === 'close') {
    delete map[eventKey('open', coin)];
  }
  await saveMap(map);
  return true;
}

/** Marque les positions déjà ouvertes sans envoyer de notif (sync au boot). */
export async function markPositionsAsKnown(coins: string[]): Promise<void> {
  const map = await loadMap();
  const now = Date.now();
  for (const coin of coins) {
    map[eventKey('open', coin)] = now;
  }
  await saveMap(map);
}
