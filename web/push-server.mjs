import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAPID_FILE = path.join(__dirname, '.vapid.json');
const SUBS_FILE = path.join(__dirname, 'push-subscriptions.json');
const MOBILE_FILE = path.join(__dirname, 'expo-push-tokens.json');
const STATE_FILE = path.join(__dirname, 'push-state.json');
const TRADER_WALLET =
  process.env.VITE_TRADER_WALLET ?? '0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F';
const API_URL = 'https://api.hyperliquid.xyz/info';
const POLL_MS = Number(process.env.PUSH_POLL_MS) || 25_000;
const BRAND = 'A&T CAPITAL';

let webSubscriptions = [];
let mobileTokens = [];
let state = { initialized: false, coins: [], notified: {} };

function loadJson(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadSubs() {
  webSubscriptions = loadJson(SUBS_FILE, []);
  mobileTokens = loadJson(MOBILE_FILE, []);
  state = loadJson(STATE_FILE, { initialized: false, coins: [], notified: {} });
  if (!Array.isArray(state.coins)) state.coins = [];
  if (!state.notified || typeof state.notified !== 'object') state.notified = {};
}

const NOTIFY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function shouldServerNotify(type, coin) {
  const key = `${type}:${coin}`;
  const last = state.notified[key];
  if (last != null && Date.now() - last < NOTIFY_TTL_MS) return false;
  state.notified[key] = Date.now();
  if (type === 'close') delete state.notified[`open:${coin}`];
  return true;
}

function pruneNotified() {
  const now = Date.now();
  for (const [k, ts] of Object.entries(state.notified)) {
    if (now - ts >= NOTIFY_TTL_MS) delete state.notified[k];
  }
}

function saveWebSubs() {
  saveJson(SUBS_FILE, webSubscriptions);
}

function saveMobileTokens() {
  saveJson(MOBILE_FILE, mobileTokens);
}

function saveState() {
  saveJson(STATE_FILE, state);
}

function getVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }
  if (fs.existsSync(VAPID_FILE)) {
    return JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
  }
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  console.log('[push] Clés VAPID générées →', VAPID_FILE);
  return keys;
}

const vapid = getVapidKeys();
webpush.setVapidDetails(
  'mailto:contact@atcapital.fr',
  vapid.publicKey,
  vapid.privateKey
);

loadSubs();

async function postInfo(body) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HL API ${res.status}`);
  return res.json();
}

async function fetchOpenPositions() {
  const data = await postInfo({
    type: 'clearinghouseState',
    user: TRADER_WALLET,
  });
  return (data.assetPositions ?? [])
    .map((ap) => {
      const p = ap.position;
      const size = parseFloat(p?.szi ?? '0');
      if (Math.abs(size) < 1e-12) return null;
      return {
        coin: p.coin,
        isLong: size > 0,
      };
    })
    .filter(Boolean);
}

async function fetchFills() {
  const data = await postInfo({ type: 'userFills', user: TRADER_WALLET });
  return Array.isArray(data) ? data : [];
}

function formatUsd(n) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function closePnlFromFills(fills, coin) {
  const close = fills
    .filter((f) => f.coin === coin && String(f.dir).includes('Close'))
    .sort((a, b) => b.time - a.time)[0];
  if (!close) return 0;
  return parseFloat(close.closedPnl ?? 0) - parseFloat(close.fee ?? 0);
}

async function sendWebPush(title, body) {
  const payload = JSON.stringify({ title, body });
  const dead = [];

  for (let i = 0; i < webSubscriptions.length; i++) {
    try {
      await webpush.sendNotification(webSubscriptions[i], payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) dead.push(i);
      else console.warn('[push] web:', err.message);
    }
  }

  if (dead.length) {
    webSubscriptions = webSubscriptions.filter((_, i) => !dead.includes(i));
    saveWebSubs();
  }
}

async function sendExpoPush(token, title, body) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      title,
      body,
      sound: 'default',
      priority: 'high',
      channelId: 'trades',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Expo push ${res.status}: ${text}`);
  }
}

async function sendFcmPush(token, title, body) {
  const key = process.env.FCM_SERVER_KEY;
  if (!key) {
    console.warn('[push] FCM_SERVER_KEY manquant — skip FCM');
    return;
  }
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      priority: 'high',
      notification: { title, body, sound: 'default', channel_id: 'trades' },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FCM ${res.status}: ${text}`);
  }
}

async function sendMobilePush(title, body) {
  const dead = [];

  for (let i = 0; i < mobileTokens.length; i++) {
    const entry = mobileTokens[i];
    try {
      if (entry.type === 'expo') {
        await sendExpoPush(entry.token, title, body);
      } else if (entry.type === 'fcm') {
        await sendFcmPush(entry.token, title, body);
      }
    } catch (err) {
      console.warn('[push] mobile:', entry.type, err.message);
      if (
        String(err.message).includes('DeviceNotRegistered') ||
        String(err.message).includes('NotRegistered')
      ) {
        dead.push(i);
      }
    }
  }

  if (dead.length) {
    mobileTokens = mobileTokens.filter((_, i) => !dead.includes(i));
    saveMobileTokens();
  }
}

async function notifyAll(title, body) {
  await Promise.all([sendWebPush(title, body), sendMobilePush(title, body)]);
}

async function pollPositions() {
  try {
    const [positions, fills] = await Promise.all([
      fetchOpenPositions(),
      fetchFills(),
    ]);
    const currentCoins = positions.map((p) => p.coin);
    const currentSet = new Set(currentCoins);

    if (
      !state.initialized ||
      (state.coins.length === 0 && currentCoins.length > 0)
    ) {
      state.initialized = true;
      state.coins = currentCoins;
      for (const coin of currentCoins) {
        state.notified[`open:${coin}`] = Date.now();
      }
      pruneNotified();
      saveState();
      console.log('[push] Baseline:', currentCoins.join(', ') || '(aucune)');
      return;
    }

    const prevSet = new Set(state.coins);

    for (const p of positions) {
      if (!prevSet.has(p.coin) && shouldServerNotify('open', p.coin)) {
        const side = p.isLong ? 'LONG' : 'SHORT';
        const title = `${BRAND} · ${p.coin}`;
        const body = `Position ${side} ouverte.`;
        await notifyAll(title, body);
        console.log('[push] Ouverture:', p.coin, side);
      }
    }

    for (const coin of state.coins) {
      if (!currentSet.has(coin) && shouldServerNotify('close', coin)) {
        const net = closePnlFromFills(fills, coin);
        const label = net >= 0 ? 'Gain' : 'Perte';
        const title = `${BRAND} · ${coin}`;
        const body = `Position fermée · ${label} ${formatUsd(net)}`;
        await notifyAll(title, body);
        console.log('[push] Fermeture:', coin, body);
      }
    }

    state.coins = currentCoins;
    pruneNotified();
    saveState();
  } catch (e) {
    console.warn('[push] poll:', e.message);
  }
}

/** Express middleware / standalone handlers */
export function mountPushRoutes(app, express) {
  app.get('/api/push/vapid-public', (_req, res) => {
    res.json({ publicKey: vapid.publicKey });
  });

  app.post('/api/push/subscribe', express.json(), (req, res) => {
    const sub = req.body;
    if (!sub?.endpoint) {
      res.status(400).json({ error: 'Subscription invalide' });
      return;
    }
    const exists = webSubscriptions.some((s) => s.endpoint === sub.endpoint);
    if (!exists) {
      webSubscriptions.push(sub);
      saveWebSubs();
    }
    res.status(201).json({ ok: true });
  });

  app.post('/api/push/mobile-subscribe', express.json(), (req, res) => {
    const { type, token, platform } = req.body ?? {};
    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token invalide' });
      return;
    }
    const kind = type === 'expo' || type === 'fcm' ? type : 'fcm';
    const entry = { type: kind, token, platform: platform ?? 'unknown' };
    const idx = mobileTokens.findIndex((t) => t.token === token);
    if (idx >= 0) mobileTokens[idx] = entry;
    else mobileTokens.push(entry);
    saveMobileTokens();
    console.log('[push] Mobile enregistré:', kind, platform);
    res.status(201).json({ ok: true, subscribers: mobileTokens.length });
  });

  app.get('/api/push/status', (_req, res) => {
    res.json({
      webSubscribers: webSubscriptions.length,
      mobileSubscribers: mobileTokens.length,
      tracking: state.coins,
      initialized: state.initialized,
      fcmConfigured: Boolean(process.env.FCM_SERVER_KEY),
    });
  });
}

export function startPushPoller() {
  pollPositions();
  setInterval(pollPositions, POLL_MS);
  console.log(
    `[push] Surveillance HL · web=${webSubscriptions.length} mobile=${mobileTokens.length} · poll ${POLL_MS}ms`
  );
}

/** Standalone API server for Vite dev proxy */
export function startPushApiServer(port = 3001) {
  import('express').then(({ default: express }) => {
    const app = express();
    mountPushRoutes(app, express);
    startPushPoller();
    app.listen(port, () => {
      console.log(`[push] API → http://127.0.0.1:${port}`);
    });
  });
}
