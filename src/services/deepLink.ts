import * as Linking from 'expo-linking';
import type { TabId } from '../components/TabBar';

/** Routes reconnues : atcapital://app, https://atcapital.up.railway.app/app */
export function tabFromDeepLink(url: string | null): TabId | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const path = (parsed.path ?? '').replace(/^\//, '');
    if (path === 'app' || path.startsWith('app/')) return 'live';
    if (path === 'history' || path.startsWith('history')) return 'history';
    if (path === 'about' || path.startsWith('about')) return 'about';
    if (parsed.hostname === 'app') return 'live';
  } catch {
    if (url.includes('/app')) return 'live';
    if (url.includes('/history')) return 'history';
  }
  return null;
}

export function getAppDeepLink(tab: TabId = 'live'): string {
  return Linking.createURL(tab === 'live' ? '/app' : `/${tab}`, { scheme: 'atcapital' });
}

export const WEB_TERMINAL_URL = 'https://atcapital.up.railway.app/app';
