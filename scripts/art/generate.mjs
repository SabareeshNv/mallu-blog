// Draws the site's cover illustrations as SVG and writes them as JPEG into src/assets/images/.
//   npm run art            all of them
//   npm run art -- hero    only the named ones
// Every picture is deterministic (seeded), so re-running changes nothing unless this file changes.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT = new URL('../../src/assets/images/', import.meta.url);

// ---------------------------------------------------------------- helpers
let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r = (a, b) => a + rnd() * (b - a);
const f = (n) => Number(n.toFixed(1));

/** A film grain laid over the whole picture, so flat gradients feel printed rather than digital. */
const grain = (id) =>
  `<filter id="g${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .07"/><feComponentTransfer><feFuncA type="table" tableValues="0.04 0.1"/></feComponentTransfer></filter>`;

const svg = (W, H, id, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}${grain(id)}</defs>${body}<rect width="${W}" height="${H}" filter="url(#g${id})"/></svg>`;

const smooth = (pts, W, H) => {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = f(x0 + (x1 - x0) / 2);
    d += ` C${mx} ${f(y0)} ${mx} ${f(y1)} ${f(x1)} ${f(y1)}`;
  }
  return `${d} L${W} ${H} L0 ${H} Z`;
};
const ridge = (W, H, base, amp, n, color, opacity = 1) => {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([(W / n) * i, base - rnd() * amp]);
  return `<path d="${smooth(pts, W, H)}" fill="${color}" opacity="${opacity}"/>`;
};
const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;
const rad = (id, stops) =>
  `<radialGradient id="${id}" cx=".5" cy=".5" r=".5">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
const blur = (id, n) =>
  `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${n}"/></filter>`;

/** A coconut palm: a leaning trunk and a crown of curved fronds. */
const palm = (x, y, h, lean, color, scale = 1) => {
  const tx = x + lean,
    ty = y - h;
  let s = `<path d="M${x} ${y} Q${f(x + lean * 0.15)} ${f(y - h * 0.55)} ${tx} ${ty}" stroke="${color}" stroke-width="${f(9 * scale)}" fill="none" stroke-linecap="round"/>`;
  for (const a of [-168, -140, -112, -84, -58, -32, -8, 14]) {
    const len = (110 + ((a * 7) % 30)) * scale;
    const rad = (a * Math.PI) / 180;
    const ex = tx + Math.cos(rad) * len,
      ey = ty + Math.sin(rad) * len + len * 0.32;
    const cx = tx + Math.cos(rad) * len * 0.5,
      cy = ty + Math.sin(rad) * len * 0.5 - len * 0.18;
    const nx = -Math.sin(rad) * len * 0.09,
      ny = Math.cos(rad) * len * 0.09;
    s += `<path d="M${tx} ${ty} Q${f(cx + nx)} ${f(cy + ny)} ${f(ex)} ${f(ey)} Q${f(cx - nx)} ${f(cy - ny)} ${tx} ${ty}Z" fill="${color}"/>`;
  }
  return s;
};

const pictures = {};

// ---------------------------------------------------------------- the hero: a backwater at dusk
pictures['hero-lake-dusk'] = () => {
  seed = 101;
  const W = 2400,
    H = 1000,
    HZ = 610;
  const defs =
    lin('sky', [
      [0, '#17304f'],
      [0.32, '#3f4f86'],
      [0.58, '#b8628f'],
      [0.82, '#f19a7a'],
      [1, '#ffcf8a'],
    ]) +
    lin('water', [
      [0, '#f4a67f'],
      [0.12, '#a86a8e'],
      [0.45, '#2c4d70'],
      [1, '#0e2236'],
    ]) +
    lin('hill1', [
      [0, '#7b6aa8'],
      [1, '#b9769a'],
    ]) +
    lin('hill2', [
      [0, '#3f4f86'],
      [1, '#6a5a98'],
    ]) +
    rad('sunglow', [
      [0, '#fff1c8', 0.95],
      [0.3, '#ffc78a', 0.5],
      [1, '#ff9a7a', 0],
    ]) +
    rad('lamp', [
      [0, '#fff2b8', 1],
      [0.25, '#ffd070', 0.6],
      [1, '#ff9a40', 0],
    ]) +
    lin('cloudglow', [
      [0, '#ffb98a', 0.9],
      [1, '#7a5a9a', 0],
    ]) +
    blur('b2', 2) +
    blur('b6', 6) +
    blur('b14', 14) +
    blur('b28', 28);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  // stars coming out
  for (let i = 0; i < 140; i++)
    b += `<circle cx="${f(r(0, W))}" cy="${f(r(0, 330))}" r="${f(rnd() ** 3 * 2 + 0.5)}" fill="#fff" opacity="${f(r(0.25, 0.9))}"/>`;
  // the sun, half behind the far hills, and its glow
  b += `<circle cx="1330" cy="${HZ - 20}" r="520" fill="url(#sunglow)"/><circle cx="1330" cy="${HZ - 10}" r="74" fill="#fff4d2"/>`;
  // monsoon cloud banks: a dark roof and bright, lit undersides
  for (let i = 0; i < 9; i++) {
    const x = r(-100, W),
      y = r(40, 240),
      w = r(380, 880);
    b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(r(26, 56))}" fill="#27345c" opacity="${f(r(0.35, 0.6))}" filter="url(#b14)"/>`;
  }
  for (let i = 0; i < 8; i++) {
    const x = r(150, W - 150),
      y = r(250, 470),
      w = r(300, 760);
    b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(r(10, 22))}" fill="url(#cloudglow)" filter="url(#b6)"/>`;
    b += `<ellipse cx="${f(x)}" cy="${f(y - 14)}" rx="${f(w / 2.3)}" ry="${f(r(12, 24))}" fill="#6a5a9a" opacity="0.45" filter="url(#b6)"/>`;
  }
  // birds
  for (let i = 0; i < 9; i++) {
    const x = 640 + i * r(26, 44),
      y = 300 + Math.sin(i) * 26 + r(-10, 10),
      s = r(10, 18);
    b += `<path d="M${f(x - s)} ${f(y)} Q${f(x - s / 2)} ${f(y - s * 0.6)} ${f(x)} ${f(y)} Q${f(x + s / 2)} ${f(y - s * 0.6)} ${f(x + s)} ${f(y)}" stroke="#2a2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  // far ridges and the tree line
  b += ridge(W, H, HZ + 12, 90, 14, 'url(#hill1)', 0.9);
  b += ridge(W, H, HZ + 18, 70, 18, 'url(#hill2)');
  let trees = '';
  for (let x = -20; x < W + 20; x += r(14, 26)) {
    const h = r(26, 62);
    trees += `<ellipse cx="${f(x)}" cy="${f(HZ + 12 - h / 2)}" rx="${f(r(16, 30))}" ry="${f(h / 2 + 6)}"/>`;
  }
  b += `<g fill="#1d2b4a">${trees}</g>`;
  // palms on the far banks
  const bank = (xs, color, sc, yy) => xs.map(([x, h, l]) => palm(x, yy, h * sc, l * sc, color, sc)).join('');
  b += bank(
    [
      [130, 330, 40],
      [260, 250, -30],
      [380, 300, 36],
      [1980, 290, -36],
      [2110, 360, 30],
      [2260, 270, -40],
      [2340, 320, 24],
    ],
    '#142038',
    0.92,
    HZ + 16,
  );
  b += bank(
    [
      [620, 150, 20],
      [700, 120, -14],
      [1800, 140, -18],
      [1890, 110, 14],
    ],
    '#1b2a47',
    0.6,
    HZ + 14,
  );
  // the water: sky reflected, calm
  b += `<rect y="${HZ + 16}" width="${W}" height="${H - HZ - 16}" fill="url(#water)"/>`;
  b += `<g clip-path="url(#wclip)"><rect x="1170" y="${HZ + 20}" width="320" height="${H}" fill="url(#sunglow)" opacity="0.6" filter="url(#b14)"/></g>`;
  for (let i = 0; i < 26; i++) {
    const y = HZ + 28 + i * i * 0.45 + i * 6,
      w = 70 + i * 22 * rnd() + i * 12;
    b += `<rect x="${f(1330 - w / 2 + r(-70, 70))}" y="${f(y)}" width="${f(w)}" height="${f(1.6 + i * 0.22)}" rx="2" fill="#ffe9bd" opacity="${f(Math.max(0.12, 0.7 - i * 0.025))}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const y = HZ + 40 + rnd() * (H - HZ - 60),
      x = r(0, W);
    b += `<path d="M${f(x)} ${f(y)} q 60 -${f(r(3, 8))} 120 0" stroke="#d9e6ff" stroke-width="1.8" fill="none" opacity="${f(r(0.08, 0.26))}" stroke-linecap="round"/>`;
  }
  // reflections of the palms
  b += `<g opacity="0.35" filter="url(#b2)" transform="translate(0 ${2 * (HZ + 16)}) scale(1 -1)">${bank(
    [
      [130, 330, 40],
      [260, 250, -30],
      [380, 300, 36],
      [1980, 290, -36],
      [2110, 360, 30],
      [2260, 270, -40],
      [2340, 320, 24],
    ],
    '#0a1428',
    0.92,
    HZ + 16,
  )}</g>`;
  b += `<rect y="${HZ + 16}" width="${W}" height="${H - HZ - 16}" fill="url(#water)" opacity="0.0"/>`;
  // the lone voice: a boatman standing in a canoe with a lantern
  const bx = 1500,
    by = 792;
  b += `<ellipse cx="${bx}" cy="${by + 20}" rx="150" ry="14" fill="#0a1830" opacity="0.5" filter="url(#b6)"/>`;
  b += `<circle cx="${bx + 112}" cy="${by - 46}" r="150" fill="url(#lamp)" opacity="0.7"/>`;
  b += `<ellipse cx="${bx + 112}" cy="${by + 60}" rx="70" ry="9" fill="#ffd070" opacity="0.38" filter="url(#b6)"/>`;
  b += `<path d="M${bx - 150} ${by - 12} Q${bx} ${by + 38} ${bx + 160} ${by - 22} Q${bx + 6} ${by + 8} ${bx - 150} ${by - 12}Z" fill="#1a1626"/>`;
  b += `<path d="M${bx - 150} ${by - 12} Q${bx - 190} ${by - 34} ${bx - 176} ${by - 40} Q${bx - 150} ${by - 22} ${bx - 120} ${by - 14}Z M${bx + 160} ${by - 22} Q${bx + 196} ${by - 48} ${bx + 182} ${by - 54} Q${bx + 156} ${by - 34} ${bx + 128} ${by - 22}Z" fill="#1a1626"/>`;
  // the figure
  b += `<path d="M${bx - 16} ${by - 14} L${bx - 12} ${by - 92} Q${bx} ${by - 104} ${bx + 12} ${by - 92} L${bx + 16} ${by - 14}Z" fill="#14101f"/>`;
  b += `<circle cx="${bx}" cy="${by - 112}" r="14" fill="#14101f"/>`;
  b += `<path d="M${bx - 12} ${by - 84} L${bx - 70} ${by - 10}" stroke="#14101f" stroke-width="6" stroke-linecap="round"/>`;
  b += `<path d="M${bx - 150} ${by - 244} L${bx - 62} ${by + 30}" stroke="#241c2e" stroke-width="5" stroke-linecap="round"/>`;
  // the lantern hangs from a short bow pole
  b += `<path d="M${bx + 16} ${by - 80} L${bx + 112} ${by - 62}" stroke="#14101f" stroke-width="4" stroke-linecap="round"/>`;
  b += `<path d="M${bx + 112} ${by - 62} L${bx + 112} ${by - 52}" stroke="#14101f" stroke-width="2"/><rect x="${bx + 104}" y="${by - 52}" width="16" height="22" rx="3" fill="#ffe08a"/><rect x="${bx + 102}" y="${by - 56}" width="20" height="5" fill="#14101f"/><rect x="${bx + 102}" y="${by - 31}" width="20" height="5" fill="#14101f"/>`;
  // ripples round the boat
  for (let i = 0; i < 4; i++)
    b += `<ellipse cx="${bx + 6}" cy="${by + 18}" rx="${180 + i * 54}" ry="${12 + i * 5}" fill="none" stroke="#e9f2ff" stroke-width="1.6" opacity="${f(0.3 - i * 0.07)}"/>`;
  // fireflies
  for (let i = 0; i < 46; i++) {
    const x = r(0, W),
      y = r(560, 960),
      s = r(2, 4.4);
    b += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 3)}" fill="#fff0a0" opacity="0.14"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="#fff6c0" opacity="${f(r(0.6, 1))}"/>`;
  }
  // reeds in the foreground
  const reed = (x, h, lean) =>
    `<path d="M${x} ${H + 10} Q${f(x + lean * 0.3)} ${f(H - h * 0.5)} ${f(x + lean)} ${f(H - h)}" stroke="#0a1426" stroke-width="${f(r(3, 6))}" fill="none" stroke-linecap="round"/>`;
  let reeds = '';
  for (let i = 0; i < 36; i++) reeds += reed(r(-20, 420), r(70, 230), r(-30, 70));
  for (let i = 0; i < 36; i++) reeds += reed(r(1980, W + 20), r(70, 230), r(-70, 30));
  b += reeds;
  b += `<path d="M0 ${H} L0 ${H - 32} Q300 ${H - 70} 540 ${H - 20} L560 ${H} Z M${W} ${H} L${W} ${H - 40} Q${W - 320} ${H - 76} ${W - 560} ${H - 18} L${W - 560} ${H} Z" fill="#0a1426"/>`;
  return svg(W, H, 'h', defs + `<clipPath id="wclip"><rect y="${HZ + 16}" width="${W}" height="${H}"/></clipPath>`, b);
};

// ---------------------------------------------------------------- quiet shore, sunrise
pictures['quiet-shore'] = () => {
  seed = 11;
  const W = 1600,
    H = 800;
  const defs =
    lin('sky', [
      [0, '#5b6fa8'],
      [0.45, '#e9a0a0'],
      [0.75, '#fbd08a'],
      [1, '#fde9b8'],
    ]) +
    rad('glow', [
      [0, '#fff6d6', 0.95],
      [0.35, '#ffe3a0', 0.55],
      [1, '#ffd08a', 0],
    ]) +
    lin('sea', [
      [0, '#f3b98f'],
      [0.25, '#6fb3b5'],
      [1, '#1f6e7a'],
    ]) +
    lin('sand', [
      [0, '#f0d3a6'],
      [1, '#d9ac78'],
    ]) +
    `<clipPath id="sc"><rect x="0" y="470" width="${W}" height="330"/></clipPath>`;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="800" cy="468" r="330" fill="url(#glow)"/><circle cx="800" cy="468" r="86" fill="#fff4cf"/>`;
  for (let i = 0; i < 5; i++)
    b += `<ellipse cx="${f(r(250, 1350))}" cy="${f(r(120, 300))}" rx="${f(r(120, 260))}" ry="${f(r(8, 16))}" fill="#fff" opacity="${f(r(0.12, 0.3))}"/>`;
  b += `<rect y="468" width="${W}" height="${H - 468}" fill="url(#sea)"/><g clip-path="url(#sc)">`;
  for (let i = 0; i < 16; i++) {
    const y = 480 + i * i * 1.3 + 6,
      w = 40 + i * 28 * rnd() + i * 8;
    b += `<rect x="${f(800 - w / 2 + r(-30, 30))}" y="${f(y)}" width="${f(w)}" height="${f(2 + i * 0.5)}" rx="3" fill="#fff0c8" opacity="${f(0.75 - i * 0.04)}"/>`;
  }
  for (let i = 0; i < 22; i++) {
    const y = 500 + i * 14 + rnd() * 6;
    b += `<path d="M${f(r(0, W))} ${f(y)} q 40 -${f(r(4, 9))} 80 0" stroke="#e9fbff" stroke-width="2" fill="none" opacity="${f(r(0.15, 0.4))}" stroke-linecap="round"/>`;
  }
  b += `</g><path d="M0 ${H} L0 700 C300 640 520 700 800 690 S1300 600 1600 650 L1600 ${H}Z" fill="url(#sand)"/>`;
  b += `<path d="M0 700 C300 640 520 700 800 690 S1300 600 1600 650" stroke="#fff6e6" stroke-width="6" fill="none" opacity="0.7"/>`;
  b += `<path d="M0 ${H} L0 760 C400 730 800 780 1200 750 S1500 740 1600 745 L1600 ${H}Z" fill="#c9965f" opacity="0.55"/>`;
  b += `<path d="M1180 580 l0 -34 M1180 546 l30 26 l-30 8 z" stroke="#5b4a52" stroke-width="3" fill="#6a5560" opacity="0.8"/>`;
  return svg(W, H, 's', defs, b);
};

// ---------------------------------------------------------------- rain on a window
pictures['rain-window'] = () => {
  seed = 23;
  const W = 1600,
    H = 800;
  const defs =
    lin('sky', [
      [0, '#2a2f5a'],
      [0.6, '#6a4a86'],
      [1, '#d77a7a'],
    ]) +
    blur('b', 14) +
    blur('bs', 3) +
    `<radialGradient id="drop" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="#cfe3ff" stop-opacity=".25"/><stop offset="1" stop-color="#0a0e24" stop-opacity=".55"/></radialGradient>` +
    lin('frame', [
      [0, '#1a1424'],
      [1, '#2c2036'],
    ]);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><g filter="url(#b)">`;
  const cols = ['#ffb86b', '#ff7a8a', '#ffd9a0', '#7ad0ff', '#c58bff', '#ff9ac0'];
  for (let i = 0; i < 26; i++)
    b += `<circle cx="${f(r(0, W))}" cy="${f(r(300, 700))}" r="${f(r(26, 70))}" fill="${cols[i % cols.length]}" opacity="${f(r(0.45, 0.85))}"/>`;
  b += `</g><rect y="560" width="${W}" height="240" fill="#1a1530" opacity="0.55" filter="url(#b)"/>`;
  for (let i = 0; i < 70; i++) {
    const x = r(0, W),
      y = r(0, 560),
      l = r(60, 260);
    b += `<path d="M${f(x)} ${f(y)} q ${f(r(-6, 6))} ${f(l / 2)} ${f(r(-4, 4))} ${f(l)}" stroke="#e8f0ff" stroke-width="${f(r(1, 2.4))}" fill="none" opacity="${f(r(0.12, 0.35))}" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 90; i++) {
    const x = r(0, W),
      y = r(0, H - 60),
      rr = r(5, 18);
    b += `<g transform="translate(${f(x)} ${f(y)})"><ellipse rx="${f(rr)}" ry="${f(rr * 1.3)}" fill="url(#drop)"/><ellipse cx="${f(-rr * 0.3)}" cy="${f(-rr * 0.5)}" rx="${f(rr * 0.25)}" ry="${f(rr * 0.18)}" fill="#fff" opacity="0.8"/></g>`;
  }
  b += `<rect y="${H - 70}" width="${W}" height="70" fill="url(#frame)"/><rect y="${H - 74}" width="${W}" height="6" fill="#4a3a5a"/>`;
  b += `<ellipse cx="1180" cy="${H - 90}" rx="64" ry="8" fill="#000" opacity="0.25"/><path d="M1130 ${H - 96} h100 l-12 -62 h-76z" fill="#d9885a" opacity="0.92"/><ellipse cx="1180" cy="${H - 158}" rx="38" ry="6" fill="#6a3a2a"/><path d="M1160 ${H - 170} q-10 -26 4 -40 M1190 ${H - 170} q10 -24 -3 -42" stroke="#fff" stroke-width="4" fill="none" opacity="0.35" stroke-linecap="round" filter="url(#bs)"/>`;
  return svg(W, H, 'r', defs, b);
};

// ---------------------------------------------------------------- night sky over mountains
pictures['night-sky'] = () => {
  seed = 5;
  const W = 1600,
    H = 800;
  const defs =
    lin('sky', [
      [0, '#0b1030'],
      [0.6, '#2a2a6a'],
      [1, '#7a4a8a'],
    ]) +
    `<linearGradient id="band" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff9ad0" stop-opacity="0"/><stop offset=".4" stop-color="#e9b8ff" stop-opacity=".55"/><stop offset=".6" stop-color="#9ad0ff" stop-opacity=".5"/><stop offset="1" stop-color="#9ad0ff" stop-opacity="0"/></linearGradient>` +
    blur('b', 30) +
    blur('bs', 1.2);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><g transform="rotate(-24 800 330)"><ellipse cx="800" cy="330" rx="900" ry="95" fill="url(#band)" filter="url(#b)"/></g>`;
  for (let i = 0; i < 320; i++)
    b += `<circle cx="${f(r(0, W))}" cy="${f(r(0, 520))}" r="${f(rnd() ** 3 * 2.4 + 0.5)}" fill="#fff" opacity="${f(r(0.4, 1))}"/>`;
  for (let i = 0; i < 6; i++)
    b += `<g filter="url(#bs)"><circle cx="${f(r(100, 1500))}" cy="${f(r(40, 400))}" r="3.2" fill="#fff"/></g>`;
  b += `<path d="M1180 120 L1000 230" stroke="#fff" stroke-width="2" opacity="0.7" stroke-linecap="round"/>`;
  b +=
    ridge(W, H, 560, 130, 9, '#4d4a86', 0.85) +
    ridge(W, H, 610, 140, 8, '#35356a') +
    ridge(W, H, 660, 120, 10, '#1f2250');
  let pines = `M0 ${H} L0 720`;
  for (let x = 0; x <= W; x += 28) {
    const h = r(40, 110);
    pines += ` L${x} ${f(700 - h * 0.2)} L${x + 14} ${f(690 - h)} L${x + 28} ${f(700 - h * 0.2)}`;
  }
  b += `<path d="${pines} L${W} ${H}Z" fill="#0e1230"/><rect y="740" width="${W}" height="60" fill="#0a0d24"/>`;
  return svg(W, H, 'n', defs, b);
};

// ---------------------------------------------------------------- sunlight on a forest path
pictures['forest-path'] = () => {
  seed = 31;
  const W = 1600,
    H = 800;
  const defs =
    lin('sky', [
      [0, '#cfe8c0'],
      [1, '#f4f1c8'],
    ]) +
    lin('ray', [
      [0, '#fff8cf', 0.75],
      [1, '#fff8cf', 0],
    ]) +
    lin('path', [
      [0, '#e8d9a4'],
      [1, '#b98f5e'],
    ]) +
    blur('b', 6);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  const layer = (n, wMin, wMax, col, op) => {
    let s = '';
    for (let i = 0; i < n; i++)
      s += `<rect x="${f(r(-40, W))}" y="0" width="${f(r(wMin, wMax))}" height="${H}" fill="${col}" opacity="${op}"/>`;
    return s;
  };
  b += layer(16, 14, 30, '#a9cf9a', 0.9) + layer(12, 22, 42, '#6fae78', 0.9);
  for (let i = 0; i < 6; i++) {
    const x = r(100, 1500);
    b += `<polygon points="${f(x)},0 ${f(x + 90)},0 ${f(x + 260)},${H} ${f(x + 120)},${H}" fill="url(#ray)" filter="url(#b)" opacity="${f(r(0.35, 0.7))}"/>`;
  }
  b += `<path d="M0 ${H} L0 600 C400 560 700 600 800 560 S1300 560 1600 600 L1600 ${H}Z" fill="#7fb37a"/>`;
  b += layer(9, 44, 80, '#2f7a58', 0.96) + `<g opacity="0.9">${layer(6, 70, 120, '#1f5a46', 1)}</g>`;
  b += `<path d="M610 ${H} C700 720 740 650 790 570 C800 566 812 566 822 570 C880 650 960 720 1110 ${H}Z" fill="url(#path)"/><path d="M700 ${H} C760 730 790 660 806 590" stroke="#fff3c4" stroke-width="5" fill="none" opacity="0.35" stroke-linecap="round"/>`;
  for (let i = 0; i < 40; i++)
    b += `<ellipse cx="${f(r(0, W))}" cy="${f(r(520, 780))}" rx="${f(r(14, 40))}" ry="${f(r(3, 8))}" fill="#fff7c8" opacity="${f(r(0.05, 0.22))}"/>`;
  b += `<path d="M0 ${H} L0 740 C300 700 500 760 760 ${H}Z M1600 ${H} L1600 730 C1350 700 1200 770 1010 ${H}Z" fill="#1b4a3a"/>`;
  return svg(W, H, 'f', defs, b);
};

// ---------------------------------------------------------------- a book and a cup of coffee
pictures['book-and-coffee'] = () => {
  seed = 41;
  const W = 1600,
    H = 800;
  const defs =
    lin('wall', [
      [0, '#f6e7cd'],
      [1, '#e8c8a0'],
    ]) +
    lin('wood', [
      [0, '#b9814f'],
      [1, '#7c4e2e'],
    ]) +
    lin('page', [
      [0, '#fffaf0'],
      [1, '#f0e4cb'],
    ]) +
    lin(
      'spine',
      [
        [0, '#000', 0],
        [0.5, '#4a3320', 0.35],
        [1, '#000', 0],
      ],
      1,
      0,
    ) +
    blur('b', 6) +
    blur('b2', 2) +
    lin('light', [
      [0, '#fff', 0.55],
      [1, '#fff', 0],
    ]);
  let b = `<rect width="${W}" height="${H}" fill="url(#wall)"/>`;
  b += `<polygon points="240,0 520,0 760,470 380,470" fill="url(#light)" filter="url(#b)"/><polygon points="620,0 740,0 920,470 760,470" fill="url(#light)" opacity="0.6" filter="url(#b)"/>`;
  b += `<rect y="470" width="${W}" height="330" fill="url(#wood)"/>`;
  for (let i = 0; i < 26; i++)
    b += `<path d="M0 ${f(486 + i * 13 + r(-3, 3))} C400 ${f(480 + i * 13 + r(-6, 6))} 1000 ${f(494 + i * 13 + r(-6, 6))} 1600 ${f(486 + i * 13)}" stroke="#4a2c1a" stroke-width="${f(r(1, 2.4))}" fill="none" opacity="${f(r(0.06, 0.2))}"/>`;
  b += `<polygon points="300,600 760,520 760,570 300,650" fill="#fff" opacity="0.0"/>`;
  b += `<ellipse cx="760" cy="740" rx="560" ry="30" fill="#2a1608" opacity="0.28" filter="url(#b)"/>`;
  // cover and pages
  b += `<polygon points="322,568 760,528 1204,568 1236,742 760,716 296,744" fill="#2b5b63"/>`;
  b += `<polygon points="346,560 760,524 1180,560 1206,728 760,704 322,730" fill="#e9dcc0"/>`;
  b += `<polygon points="352,548 760,514 1170,548 1190,700 760,676 336,702" fill="url(#page)"/>`;
  b += `<polygon points="760,514 1170,548 1190,700 760,676" fill="#000" opacity="0.04"/><polygon points="352,548 760,514 760,676 336,702" fill="url(#page)"/>`;
  for (let i = 0; i < 9; i++) {
    const k = i * 17,
      w = 320 - (i % 3) * 24;
    b += `<path d="M${380 + i * 1.4} ${566 + k * 0.82} L${380 + w} ${556 + k * 0.82 - 4}" stroke="#a69477" stroke-width="3" opacity="0.6" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const k = i * 17,
      w = 300 - (i % 4) * 22;
    b += `<path d="M${806} ${532 + k * 0.82} L${806 + w} ${548 + k * 0.82 + 6}" stroke="#a69477" stroke-width="3" opacity="0.6" stroke-linecap="round"/>`;
  }
  b += `<rect x="700" y="510" width="120" height="190" fill="url(#spine)"/>`;
  // glasses
  b += `<g fill="none" stroke="#3b2a22" stroke-width="5"><circle cx="520" cy="610" r="36"/><circle cx="612" cy="606" r="36"/><path d="M556 608 Q566 596 576 606"/><path d="M484 604 L440 580 M648 600 L690 574" stroke-linecap="round"/></g><circle cx="520" cy="610" r="30" fill="#fff" opacity="0.18"/><circle cx="612" cy="606" r="30" fill="#fff" opacity="0.18"/>`;
  // cup and saucer
  b += `<ellipse cx="1330" cy="738" rx="170" ry="28" fill="#2a1608" opacity="0.35" filter="url(#b2)"/><ellipse cx="1320" cy="716" rx="146" ry="26" fill="#f3efe6"/><ellipse cx="1320" cy="712" rx="104" ry="18" fill="#e4ddcf"/>`;
  b += `<path d="M1236 590 L1404 590 Q1400 700 1320 706 Q1240 700 1236 590Z" fill="#faf6ee"/><path d="M1398 612 q54 -8 52 38 q-2 40 -62 30" stroke="#faf6ee" stroke-width="14" fill="none" stroke-linecap="round"/><ellipse cx="1320" cy="590" rx="84" ry="16" fill="#e8e0d0"/><ellipse cx="1320" cy="593" rx="72" ry="12" fill="#4a2c1c"/><ellipse cx="1296" cy="590" rx="26" ry="3.4" fill="#fff" opacity="0.4"/>`;
  b += `<path d="M1296 560 q-24 -44 4 -84 q26 -40 -4 -78 M1344 556 q22 -40 -4 -74 q-24 -34 6 -70" stroke="#fff" stroke-width="12" fill="none" opacity="0.38" stroke-linecap="round" filter="url(#b2)"/>`;
  // a plant by the window
  b += `<path d="M120 470 h110 l-14 -88 h-82z" fill="#c9714a"/><rect x="116" y="462" width="118" height="14" fill="#b05f3c"/>`;
  for (const [a, l] of [
    [-70, 150],
    [-40, 190],
    [-14, 200],
    [16, 190],
    [44, 160],
    [72, 120],
  ]) {
    const t = (a * Math.PI) / 180;
    b += `<path d="M175 460 Q${f(175 + Math.sin(t) * l * 0.5)} ${f(460 - l * 0.7)} ${f(175 + Math.sin(t) * l)} ${f(460 - Math.cos(t) * l)} Q${f(175 + Math.sin(t) * l * 0.5 + 24)} ${f(460 - l * 0.5)} 175 460Z" fill="#5f9a6a" opacity="0.95"/>`;
  }
  return svg(W, H, 'b', defs, b);
};

// ---------------------------------------------------------------- a fountain pen on a handwritten page
pictures['fountain-pen'] = () => {
  seed = 53;
  const W = 1600,
    H = 800;
  const defs =
    lin('desk', [
      [0, '#1a3a48'],
      [1, '#0d1e28'],
    ]) +
    rad('lamp', [
      [0, '#ffe3a0', 0.55],
      [1, '#ffb050', 0],
    ]) +
    lin('paper', [
      [0, '#fffaf0'],
      [1, '#efe3c9'],
    ]) +
    lin(
      'body',
      [
        [0, '#1b2f4a'],
        [0.5, '#2f4f7a'],
        [1, '#14233a'],
      ],
      0,
      1,
    ) +
    lin(
      'gold',
      [
        [0, '#f8dc8a'],
        [0.5, '#c79a3e'],
        [1, '#f3d27a'],
      ],
      0,
      1,
    ) +
    blur('b', 8) +
    blur('b2', 2);
  let b = `<rect width="${W}" height="${H}" fill="url(#desk)"/><circle cx="420" cy="140" r="620" fill="url(#lamp)"/>`;
  b += `<g transform="rotate(-6 800 400)"><rect x="342" y="80" width="900" height="660" rx="6" fill="#000" opacity="0.28" transform="translate(10 18)" filter="url(#b)"/><rect x="340" y="70" width="900" height="660" rx="6" fill="url(#paper)"/>`;
  for (let i = 0; i < 12; i++)
    b += `<path d="M340 ${150 + i * 48} H1240" stroke="#9fb9d4" stroke-width="2" opacity="0.7"/>`;
  b += `<path d="M420 70 V730" stroke="#e8a0a0" stroke-width="2" opacity="0.7"/>`;
  // handwriting
  for (let i = 0; i < 5; i++) {
    const y = 140 + i * 48,
      len = i === 4 ? 360 : r(560, 740);
    let d = `M460 ${y}`;
    for (let x = 460; x < 460 + len; x += 22) d += ` q 5 ${f(-r(10, 28))} 11 ${f(r(-4, 6))} t 11 ${f(r(-4, 4))}`;
    b += `<path d="${d}" stroke="#1d3f8a" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>`;
  }
  b += `<ellipse cx="830" cy="378" rx="9" ry="6" fill="#1d3f8a" opacity="0.9"/></g>`;
  // the pen
  b += `<g transform="translate(850 392) rotate(-36)"><ellipse cx="260" cy="30" rx="320" ry="14" fill="#000" opacity="0.3" transform="translate(0 40)" filter="url(#b2)"/>`;
  b += `<path d="M0 0 L120 -16 L120 16Z" fill="url(#gold)"/><path d="M0 0 L120 0" stroke="#7a5a1e" stroke-width="2"/><rect x="118" y="-18" width="150" height="36" rx="8" fill="#0f1b2b"/><rect x="262" y="-26" width="18" height="52" rx="5" fill="url(#gold)"/><rect x="278" y="-28" width="360" height="56" rx="26" fill="url(#body)"/><rect x="300" y="-20" width="280" height="8" rx="4" fill="#fff" opacity="0.22"/><rect x="560" y="-30" width="14" height="60" fill="url(#gold)"/><path d="M590 -14 H690 V14 H590Z" fill="url(#gold)"/></g>`;
  for (let i = 0; i < 30; i++)
    b += `<circle cx="${f(r(0, W))}" cy="${f(r(0, 500))}" r="${f(r(1, 2.6))}" fill="#ffe9b0" opacity="${f(r(0.15, 0.6))}"/>`;
  return svg(W, H, 'p', defs, b);
};

// ---------------------------------------------------------------- a winding road through red canyons
pictures['open-road'] = () => {
  seed = 67;
  const W = 1600,
    H = 800;
  const defs =
    lin('sky', [
      [0, '#f2977a'],
      [0.5, '#f9c08a'],
      [1, '#fde4b8'],
    ]) +
    rad('sun', [
      [0, '#fff2c8', 1],
      [0.3, '#ffd08a', 0.6],
      [1, '#ffb070', 0],
    ]) +
    lin('road', [
      [0, '#4a3a4c'],
      [1, '#2c2330'],
    ]) +
    blur('b', 10);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="800" cy="440" r="380" fill="url(#sun)"/><circle cx="800" cy="450" r="62" fill="#fff4d0"/>`;
  for (let i = 0; i < 5; i++)
    b += `<ellipse cx="${f(r(200, 1400))}" cy="${f(r(100, 300))}" rx="${f(r(160, 340))}" ry="${f(r(8, 16))}" fill="#fff" opacity="${f(r(0.2, 0.45))}"/>`;
  for (let i = 0; i < 5; i++) {
    const x = 480 + i * 40 + r(-8, 8),
      y = 190 + i * 10,
      s = 12;
    b += `<path d="M${x - s} ${y} Q${x - s / 2} ${y - 8} ${x} ${y} Q${x + s / 2} ${y - 8} ${x + s} ${y}" stroke="#7a3a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  const mesa = (x0, w, top, base, col, op = 1) =>
    `<path d="M${x0} ${base} L${x0 + w * 0.06} ${top + 40} L${x0 + w * 0.12} ${top} L${x0 + w * 0.88} ${top} L${x0 + w * 0.94} ${top + 40} L${x0 + w} ${base}Z" fill="${col}" opacity="${op}"/>`;
  b +=
    mesa(-60, 520, 380, 470, '#e6a08e', 0.9) +
    mesa(1080, 640, 360, 470, '#e6a08e', 0.9) +
    mesa(260, 380, 400, 470, '#dc8a78', 0.9);
  b +=
    mesa(-120, 680, 330, 520, '#c9694c') + mesa(1000, 760, 300, 520, '#c9694c') + mesa(620, 360, 410, 470, '#d57a60');
  b += `<path d="M0 520 L0 280 L90 270 L130 330 L260 340 L300 520Z M1600 520 L1600 260 L1480 262 L1440 340 L1330 350 L1280 520Z" fill="#a3432f"/>`;
  b += `<rect y="470" width="${W}" height="${H - 470}" fill="#e2a27a"/>`;
  b += `<path d="M0 470 L1600 470 L1600 520 L0 560Z" fill="#d68c68" opacity="0.6"/>`;
  b += `<path d="M770 470 C820 520 640 570 600 620 C560 680 760 700 700 800 L1000 800 C1000 720 880 690 900 640 C920 590 850 520 830 470Z" fill="url(#road)"/>`;
  b += `<path d="M800 470 C830 520 700 566 668 620 C634 680 810 700 800 800" stroke="#f6d590" stroke-width="4" stroke-dasharray="26 22" fill="none" opacity="0.9"/>`;
  b += `<path d="M0 ${H} L0 600 C200 580 380 650 520 ${H}Z M1600 ${H} L1600 620 C1420 600 1240 680 1140 ${H}Z" fill="#8f3a2c"/><path d="M0 ${H} L0 700 C150 690 260 740 330 ${H}Z M1600 ${H} L1600 720 C1480 710 1380 760 1330 ${H}Z" fill="#5a2a27"/>`;
  return svg(W, H, 'o', defs, b);
};

// ---------------------------------------------------------------- run
const wanted = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
for (const [name, draw] of Object.entries(pictures)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const markup = draw();
  const { width, height } = await sharp(Buffer.from(markup)).metadata();
  const scale = 2000 / width;
  const file = fileURLToPath(new URL(`${name}.jpg`, OUT));
  await sharp(Buffer.from(markup), { density: 72 * scale })
    .resize(Math.round(width * scale), Math.round(height * scale))
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(file);
  console.log('wrote', name);
}
