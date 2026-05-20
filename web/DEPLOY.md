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

## Notifications push (optionnel)

Le serveur push (`npm run dev` ou `push-api.mjs` sur Railway) doit tourner à part pour les alertes web. Configurer `VITE_PUSH_API` si l'API n'est pas sur le même domaine.

## APK Android

Après `bash scripts/setup-and-build.sh`, l'APK est publiée sur :

- `https://atcapital.fr/AT-Capital-Terminal-277.apk`

Le bandeau mobile du site propose « Ouvrir l'app » ou « Installer l'APK ».

### App Links (Android)

Fichier `web/public/.well-known/assetlinks.json` : remplacer `REPLACE_WITH_RELEASE_SHA256` par l'empreinte SHA-256 du certificat de signature release (`keytool -list -v -keystore ...`).

## Contact

E-mail affiché sur le site : `contact@atcapital.fr` (à configurer chez le registrar / boîte mail).
