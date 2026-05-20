import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SA_FILE = path.join(__dirname, '.fcm-service-account.json');

let cached = { token: null, exp: 0 };
let serviceAccount = null;

function parseServiceAccount(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const sa = JSON.parse(raw.trim());
    if (!sa?.client_email || !sa?.private_key || !sa?.project_id) return null;
    if (!sa.private_key.includes('\n')) {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
    return sa;
  } catch {
    /* ignore */
  }
  return null;
}

export function loadFcmServiceAccount() {
  if (serviceAccount) return serviceAccount;

  const fromEnv = parseServiceAccount(process.env.FCM_SERVICE_ACCOUNT_JSON);
  if (fromEnv) {
    serviceAccount = fromEnv;
    return serviceAccount;
  }

  if (fs.existsSync(SA_FILE)) {
    serviceAccount = parseServiceAccount(fs.readFileSync(SA_FILE, 'utf8'));
    if (serviceAccount) return serviceAccount;
  }

  return null;
}

export function isFcmConfigured() {
  return Boolean(loadFcmServiceAccount());
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signJwt(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${payload}`;
  const key = sa.private_key.replace(/\\n/g, '\n');
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${signingInput}.${signature}`;
}

async function getAccessToken() {
  const sa = loadFcmServiceAccount();
  if (!sa) return null;

  const now = Date.now();
  if (cached.token && now < cached.exp - 60_000) return cached.token;

  const assertion = signJwt(sa);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FCM OAuth ${res.status}: ${text}`);
  }

  const data = await res.json();
  cached = {
    token: data.access_token,
    exp: now + (data.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

/**
 * Envoie une notif Android via FCM HTTP v1 (API actuelle).
 */
export async function sendFcmV1(token, title, body) {
  const sa = loadFcmServiceAccount();
  if (!sa) {
    throw new Error('FCM_SERVICE_ACCOUNT_JSON manquant');
  }

  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        android: {
          priority: 'high',
          notification: {
            channel_id: 'trades',
            sound: 'default',
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FCM v1 ${res.status}: ${text}`);
  }

  return res.json();
}

export function getFcmProjectId() {
  return loadFcmServiceAccount()?.project_id ?? null;
}
