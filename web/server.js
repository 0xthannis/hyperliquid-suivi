import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;
const dist = path.join(__dirname, 'dist');

app.use(express.static(dist, { maxAge: '1h', index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Neymo Trades web → http://0.0.0.0:${port}`);
});
