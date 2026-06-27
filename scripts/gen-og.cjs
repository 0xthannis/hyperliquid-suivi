/* Génère l'image OG/partage Thannis (1200×630, noir sur blanc, esprit Trade Republic). */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#000000" stroke-opacity="0.08"/>
  <!-- logo -->
  <rect x="90" y="86" width="92" height="92" rx="22" fill="#0a0a0b"/>
  <text x="136" y="148" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="40" font-weight="800" fill="#ffffff">TA</text>
  <text x="208" y="146" font-family="Inter, Helvetica, Arial, sans-serif" font-size="40" font-weight="800" fill="#0a0a0b" letter-spacing="0.5">THANNIS</text>
  <!-- headline -->
  <text x="90" y="332" font-family="Inter, Helvetica, Arial, sans-serif" font-size="78" font-weight="800" fill="#0a0a0b" letter-spacing="-2">Nos positions, publiques</text>
  <text x="90" y="420" font-family="Inter, Helvetica, Arial, sans-serif" font-size="78" font-weight="800" fill="#0a0a0b" letter-spacing="-2">et en temps réel.</text>
  <!-- sub -->
  <text x="90" y="480" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30" font-weight="500" fill="#6b6f76">Société de trading · Actions &amp; matières premières</text>
  <!-- footer -->
  <text x="90" y="562" font-family="Inter, Helvetica, Arial, sans-serif" font-size="28" font-weight="700" fill="#0a0a0b">thannis.com</text>
  <!-- (footer thannis.com inchangé) -->
  <text x="320" y="561" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="500" fill="#9a9ea4">Signaux vérifiables on-chain · Pas un conseil financier</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica' },
  background: '#ffffff',
});
const png = resvg.render().asPng();
const out = path.join(__dirname, '..', 'web', 'public', 'og-image.png');
fs.writeFileSync(out, png);
console.log('Wrote', out, png.length, 'bytes');
