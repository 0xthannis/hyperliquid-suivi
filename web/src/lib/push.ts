function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushState = 'unsupported' | 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export function getPushSupport(): PushState {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return 'idle';
}

export async function subscribeToPush(): Promise<{ ok: boolean; message: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, message: 'Ton navigateur ne supporte pas les notifications push.' };
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const { publicKey } = await fetch('/api/push/vapid-public').then((r) => {
      if (!r.ok) throw new Error('Clés push indisponibles');
      return r.json() as Promise<{ publicKey: string }>;
    });

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });

    if (!res.ok) throw new Error('Enregistrement serveur échoué');

    return {
      ok: true,
      message: 'Alertes activées. Vous serez notifié à chaque nouvelle position.',
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    return { ok: false, message: msg };
  }
}

export async function requestPushPermission(): Promise<{
  ok: boolean;
  message: string;
  state: PushState;
}> {
  if (!('Notification' in window)) {
    return { ok: false, message: 'Notifications non supportées', state: 'unsupported' };
  }

  const perm = await Notification.requestPermission();
  if (perm === 'denied') {
    return {
      ok: false,
      message: 'Notifications bloquées. Autorise-les dans les réglages du navigateur.',
      state: 'denied',
    };
  }
  if (perm !== 'granted') {
    return { ok: false, message: 'Permission refusée', state: 'denied' };
  }

  return { ...(await subscribeToPush()), state: 'granted' };
}
