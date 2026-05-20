import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { mountPushRoutes, startPushPoller } from './push-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const dist = path.join(__dirname, 'dist');

mountPushRoutes(app, express);
startPushPoller();

app.use(express.static(dist, { maxAge: '1h', index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`A&T CAPITAL · Terminal 277 → http://0.0.0.0:${port}`);
});
