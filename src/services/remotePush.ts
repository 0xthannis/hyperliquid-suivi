import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PUSH_API_BASE,
  STORAGE_KEY_PUSH_TOKEN,
  STORAGE_KEY_REMOTE_PUSH,
} from '../constants';

export type RemotePushResult =
  | { ok: true; kind: 'expo' | 'fcm' }
  | { ok: false; reason: string };

function pushApiBase(): string {
  const extra = Constants.expoConfig?.extra as
    | { pushApiUrl?: string }
    | undefined;
  return extra?.pushApiUrl ?? PUSH_API_BASE;
}

async function resolvePushToken(): Promise<{
  type: 'expo' | 'fcm';
  token: string;
} | null> {
  if (!Device.isDevice) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const validProject =
    typeof projectId === 'string' &&
    projectId.length > 10 &&
    !projectId.includes('local');

  if (validProject) {
    try {
      const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
      return { type: 'expo', token: data };
    } catch (e) {
      console.warn('[remotePush] Expo token:', e);
    }
  }

  try {
    const device = await Notifications.getDevicePushTokenAsync();
    if (device.type === 'android') {
      return { type: 'fcm', token: String(device.data) };
    }
    if (device.type === 'ios') {
      return { type: 'fcm', token: String(device.data) };
    }
  } catch (e) {
    console.warn('[remotePush] Device token:', e);
  }

  return null;
}

/**
 * Enregistre le téléphone sur le serveur Railway pour recevoir les alertes
 * même quand l'app est fermée (push distant).
 */
export async function registerRemotePush(): Promise<RemotePushResult> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  const resolved = await resolvePushToken();
  if (!resolved) {
    return { ok: false, reason: 'no_push_token' };
  }

  const stored = await AsyncStorage.getItem(STORAGE_KEY_PUSH_TOKEN);
  if (stored === `${resolved.type}:${resolved.token}`) {
    return { ok: true, kind: resolved.type };
  }

  const base = pushApiBase().replace(/\/$/, '');
  const res = await fetch(`${base}/api/push/mobile-subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: resolved.type,
      token: resolved.token,
      platform: Platform.OS,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, reason: `server_${res.status}:${text}` };
  }

  await AsyncStorage.multiSet([
    [STORAGE_KEY_PUSH_TOKEN, `${resolved.type}:${resolved.token}`],
    [STORAGE_KEY_REMOTE_PUSH, '1'],
  ]);
  return { ok: true, kind: resolved.type };
}
