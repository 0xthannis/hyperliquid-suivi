# Déploiement · Railway

## URL de production (sans domaine custom)

- Production : **https://atcapital.up.railway.app**
- Service Railway : **Root Directory** = `web`

### Railway

1. Repo GitHub connecté, branche `main`.
2. **Root Directory** : `web`
3. Variables :
   - `FCM_SERVICE_ACCOUNT_JSON` (voir ci-dessous)
   - `PUSH_DATA_DIR` = `/data/push` + volume monté sur `/data/push` (recommandé)
   - `VITE_TRADER_WALLET` (optionnel) : adresse wallet Hyperliquid à suivre.

### Domaine custom (plus tard)

Quand `atcapital.fr` sera acheté : ajouter le domaine dans Railway et mettre à jour `SITE_URL` dans `src/constants.ts`, `web/src/constants.ts`, `app.config.js`, `web/index.html`.

## Build local

```bash
cd web && npm run build
```

Les fichiers statiques sont dans `web/dist/`.

## Notifications push (web + mobile app fermée)

Le serveur Express (`server.js` sur Railway) lance automatiquement la surveillance Hyperliquid (`push-server.mjs`) :

- **Web** : abonnement via le navigateur (`/api/push/subscribe`).
- **Mobile** : l'app s'enregistre au lancement sur `/api/push/mobile-subscribe`.

### Firebase — API actuelle (HTTP v1)

L'ancienne API (clé serveur `AAAA...`) est **désactivée** chez Google. Il faut un **compte de service** :

1. [Firebase Console](https://console.firebase.google.com) → ton projet.
2. **⚙️ Paramètres du projet** → onglet **Comptes de service**.
3. **Générer une nouvelle clé privée** → télécharge un fichier `.json`.
4. Dans [Google Cloud Console](https://console.cloud.google.com) (même projet), vérifie que l'API **Firebase Cloud Messaging** est **activée** (APIs & Services → Bibliothèque).

### Railway — variable obligatoire (Android, app fermée)

Dans le service **web** sur Railway → **Variables** :

| Variable | Valeur |
|----------|--------|
| `FCM_SERVICE_ACCOUNT_JSON` | **Tout le contenu** du fichier JSON téléchargé, sur **une ligne** (Railway accepte le JSON minifié) |

Exemple (tronqué) :

```json
{"type":"service_account","project_id":"mon-projet-123","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@mon-projet-123.iam.gserviceaccount.com",...}
```

**Ne pas** utiliser la « clé API Android » affichée dans Paramètres → Général.

Redéployer le service après avoir ajouté la variable.

**Important :** sans volume disque, Railway **efface** les abonnés (web + mobile) à **chaque redéploiement** → les compteurs repassent à 0. C’est normal.

#### Garder les abonnés après un redeploy (recommandé)

1. Vue **Architecture** du projet → **⌘K** (ou Ctrl+K) → taper **volume** → **Create Volume**
2. Attacher au service **web**, mount path : `/data/push`
3. Variable : `PUSH_DATA_DIR` = `/data/push`
4. Redéployer

Sinon : ré-enregistrer le **navigateur** (bouton alertes sur le site) et le **téléphone** (À propos → Activer les alertes serveur) après chaque deploy.

### Vérifier

`GET https://atcapital.up.railway.app/api/push/status`

```json
{
  "fcmConfigured": true,
  "fcmMode": "http-v1",
  "fcmProjectId": "mon-projet-123",
  "mobileSubscribers": 1
}
```

### App Android (APK) — obligatoire si `mobileSubscribers: 0`

1. Firebase → **Ajouter une app** → **Android**, package exact : `com.thanh.suivitrades`.
2. Télécharger **`google-services.json`**.
3. Le placer à la **racine du repo** : `hyperliquid-suivi/google-services.json` (pas seulement sur Railway).
4. Rebuild : `bash scripts/setup-and-build.sh`.
5. Installer l'APK → onglet **À propos** → **Activer les alertes serveur**.
6. Vérifier `mobileSubscribers` ≥ 1 sur `/api/push/status`.

## APK Android

Après `bash scripts/setup-and-build.sh`, l'APK est publiée sur :

- `https://atcapital.up.railway.app/AT-Capital-Terminal-277.apk`

### App Links (Android)

Fichier `web/public/.well-known/assetlinks.json` : remplacer `REPLACE_WITH_RELEASE_SHA256` par l'empreinte SHA-256 du certificat release.

## Contact

E-mail affiché sur le site : `contact@atcapital.fr`
