# Neymo Trades

Application mobile + site web pour suivre en temps réel les positions Hyperliquid de Neymo.

## Site web (Railway)

```bash
cd web
npm install
npm run dev    # http://localhost:5173
```

Déploiement Railway : voir [web/README.md](web/README.md) — définir le **root directory** sur `web`.

## App Android

## Fonctionnalités

- Positions en direct (rafraîchissement ~12 s)
- Notification quand une nouvelle position s'ouvre
- Scénarios **stop loss** et **take profit** en dollars
- Historique des ouvertures / fermetures
- Interface en français, vocabulaire simple

## Lancer en développement

```bash
cd /Users/thanh/projects/hyperliquid-suivi
npm install
npx expo start
```

Scanne le QR code avec **Expo Go** sur Android.

## Générer l'APK

### Option A — EAS Build (recommandé, cloud)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

Tu recevras un lien pour télécharger l'APK.

### Option B — Build local (Android SDK requis)

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

APK : `android/app/build/outputs/apk/release/app-release.apk`

## Wallet suivi

`0x994Ff80b7dA1174a164e0F93121bDfbb68cf7A3F` (modifiable dans `src/constants.ts`)

## Notifications

Au premier lancement, accepte les notifications. En arrière-plan, l'app vérifie les nouvelles positions toutes les ~5 minutes (limitation Android).

Pour des alertes plus rapides, garde l'app ouverte ou récente — le polling actif est toutes les 12 secondes.
