# A&T CAPITAL · Terminal 277 — Site web

Version web du suivi Hyperliquid (même données que l'app Android).

## Développement local

```bash
cd web
npm install
npm run dev
```

Ouvre http://localhost:5173

## Déployer sur Railway

1. Crée un projet sur [Railway](https://railway.app)
2. **New Project** → **Deploy from GitHub** (ou CLI)
3. Définis le **Root Directory** sur `web` si le repo contient aussi l'app mobile
4. Variables d'environnement (optionnel) :
   - `VITE_TRADER_WALLET` — adresse wallet à suivre
5. Railway détecte `railway.toml` :
   - Build : `npm install && npm run build`
   - Start : `npm start` (serveur Express sur `PORT`)

### Déploiement via CLI

```bash
cd web
npm install -g @railway/cli
railway login
railway init
railway up
```

## Scripts

| Commande | Description |
|--------|-------------|
| `npm run dev` | Dev Vite |
| `npm run build` | Build production → `dist/` |
| `npm start` | Serve `dist/` (production) |
