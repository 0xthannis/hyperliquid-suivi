/* Génère l'icône AT Trading (monogramme A, dégradé bleu sur noir) en PNG 1024². */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const S = 1024;
const png = new PNG({ width: S, height: S });

const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const bgTop = hex('#0c1018');
const bgBot = hex('#030409');
const aTop = hex('#e3e9ff');
const aBot = hex('#6f8dff');

// Monogramme « A » stylisé : lame gauche (triangle) + jambe droite (parallélogramme), sans barre.
const left = [
  [560, 200],
  [430, 884],
  [250, 884],
];
const right = [
  [598, 470],
  [690, 470],
  [800, 884],
  [652, 884],
];

function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1],
      xj = poly[j][0],
      yj = poly[j][1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const yTop = 200;
const yBot = 884;
function aColor(y) {
  const t = Math.min(1, Math.max(0, (y - yTop) / (yBot - yTop)));
  return [lerp(aTop[0], aBot[0], t), lerp(aTop[1], aBot[1], t), lerp(aTop[2], aBot[2], t)];
}

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    let cov = 0;
    for (let sy = 0; sy < 2; sy++) {
      for (let sx = 0; sx < 2; sx++) {
        const fx = x + 0.25 + sx * 0.5;
        const fy = y + 0.25 + sy * 0.5;
        if (inPoly(fx, fy, left) || inPoly(fx, fy, right)) cov += 0.25;
      }
    }
    const tb = y / S;
    let r = lerp(bgTop[0], bgBot[0], tb);
    let g = lerp(bgTop[1], bgBot[1], tb);
    let b = lerp(bgTop[2], bgBot[2], tb);

    // lueur bleue diffuse derrière le monogramme
    const dx = x - 512;
    const dy = y - 360;
    const d = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.max(0, 1 - d / 560);
    r = Math.min(255, r + glow * 26);
    g = Math.min(255, g + glow * 40);
    b = Math.min(255, b + glow * 95);

    if (cov > 0) {
      const [ar, ag, ab] = aColor(y);
      r = lerp(r, ar, cov);
      g = lerp(g, ag, cov);
      b = lerp(b, ab, cov);
    }
    const idx = (y * S + x) << 2;
    png.data[idx] = Math.round(r);
    png.data[idx + 1] = Math.round(g);
    png.data[idx + 2] = Math.round(b);
    png.data[idx + 3] = 255;
  }
}

const out = path.join(__dirname, '..', 'assets', 'icon.png');
png.pack().pipe(fs.createWriteStream(out)).on('finish', () => console.log('written', out));
