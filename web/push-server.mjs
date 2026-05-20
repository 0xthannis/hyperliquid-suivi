import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAPID_FILE = path.join(__dirname, '.vapid.json');
const SUBS_FILE = path.join(__dirname, 'push-subscriptions.json');
const TRADER_WALLET =
  process.env.VITE_TRADER_WALLET ?? '0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F';
const API_URL = 'https://api.hyperliquid.xyz/info';
const POLL_MS = 25_000;

let subscriptions = [];
let lastCoins = new Set();

function loadSubs() {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    }
  } catch {
    subscriptions = [];
  }
}

function saveSubs() {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2));
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
  'mailto:neymo9560@gmail.com',
  vapid.publicKey,
  vapid.privateKey
);

loadSubs();

async function fetchOpenCoins() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'clearinghouseState',
      user: TRADER_WALLET,
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.assetPositions ?? [])
    .map((ap) => ap.position?.coin)
    .filter(Boolean);
}

async function notifyAll(title, body) {
  const payload = JSON.stringify({ title, body });
  const dead = [];

  for (let i = 0; i < subscriptions.length; i++) {
    try {
      await webpush.sendNotification(subscriptions[i], payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) dead.push(i);
      else console.warn('[push] envoi échoué:', err.message);
    }
  }

  if (dead.length) {
    subscriptions = subscriptions.filter((_, i) => !dead.includes(i));
    saveSubs();
  }
}

async function pollPositions() {
  try {
    const coins = await fetchOpenCoins();
    const current = new Set(coins);

    for (const coin of coins) {
      if (!lastCoins.has(coin)) {
        await notifyAll(
          `A&T · ${coin}`,
          'Nouvelle position ouverte sur Hyperliquid.'
        );
        console.log('[push] Nouvelle position:', coin);
      }
    }

    lastCoins = current;
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
    const exists = subscriptions.some((s) => s.endpoint === sub.endpoint);
    if (!exists) {
      subscriptions.push(sub);
      saveSubs();
    }
    res.status(201).json({ ok: true });
  });

  app.get('/api/push/status', (_req, res) => {
    res.json({ subscribers: subscriptions.length, tracking: [...lastCoins] });
  });
}

export function startPushPoller() {
  pollPositions();
  setInterval(pollPositions, POLL_MS);
  console.log(`[push] Surveillance wallet · ${subscriptions.length} abonné(s)`);
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
