# Déploiement · atcapital.fr

## Domaine

- Production : **https://atcapital.fr**
- Configurer chez le registrar les DNS vers Vercel (ou l'hébergeur choisi).

### Vercel

1. Importer le repo GitHub.
2. **Root Directory** : laisser la racine du repo (le `vercel.json` à la racine build `web/`).
3. **Domains** : ajouter `atcapital.fr` et `www.atcapital.fr` (redirection www → apex recommandée).
4. Variables d'environnement optionnelles :
   - `VITE_TRADER_WALLET` : adresse wallet Hyperliquid à suivre.

## Build local

```bash
cd web && npm run build
```

Les fichiers statiques sont dans `web/dist/`.

## Notifications push (web + mobile app fermée)

Le serveur Express (`server.js` sur Railway) lance automatiquement la surveillance Hyperliquid (`push-server.mjs`) :

- **Web** : abonnement via le navigateur (`/api/push/subscribe`).
- **Mobile** : l'app s'enregistre au lancement sur `/api/push/mobile-subscribe`.

### Railway — variable obligatoire pour Android (APK)

Dans le service **web** sur Railway, ajouter :

| Variable | Description |
|----------|-------------|
| `FCM_SERVER_KEY` | Clé serveur Firebase (Cloud Messaging) pour envoyer les notifs quand l'app est **fermée** |

Sans cette clé, seules les notifs **locales** fonctionnent (app ouverte ou en arrière-plan).

Firebase : projet → Paramètres → Cloud Messaging → **Clé serveur** (legacy).

### Vérifier

`GET https://atcapital.fr/api/push/status` → `mobileSubscribers`, `fcmConfigured: true`.

## APK Android

Après `bash scripts/setup-and-build.sh`, l'APK est publiée sur :

- `https://atcapital.fr/AT-Capital-Terminal-277.apk`

Le bandeau mobile du site propose « Ouvrir l'app » ou « Installer l'APK ».

### App Links (Android)

Fichier `web/public/.well-known/assetlinks.json` : remplacer `REPLACE_WITH_RELEASE_SHA256` par l'empreinte SHA-256 du certificat de signature release (`keytool -list -v -keystore ...`).

## Contact

E-mail affiché sur le site : `contact@atcapital.fr` (à configurer chez le registrar / boîte mail).
