// Generates synthetic fluorescence microscopy images (SVG) for the demo.
// These are illustrations, not real patient images: blue DAPI-stained nuclei
// with coloured FISH probe signals, laid out per assay.
//
//   node scripts/generate-demo-images.mjs

import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/demo-images/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const COLORS = {
  red: "#ff4a4a",
  green: "#47ff7e",
  aqua: "#45e3ff",
  gold: "#ffcf3d",
  yellow: "#fff35a",
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200;
const H = 900;

/**
 * @param {object} o
 * @param {number} o.seed
 * @param {number} o.nuclei      how many nuclei to place
 * @param {number} o.size        nucleus radius in px
 * @param {string} o.label       overlay label (probes + magnification)
 * @param {(i:number, r:()=>number) => {color:string, n:number, cluster?:boolean}[]} o.signals
 * @param {boolean} [o.stainCells] draw a cytoplasm stain around some cells (immunofluorescence)
 * @param {(i:number)=>boolean} [o.stained]
 */
function image(o) {
  const r = rng(o.seed);
  const placed = [];
  let tries = 0;
  while (placed.length < o.nuclei && tries < 5000) {
    tries++;
    const rx = o.size * (0.85 + r() * 0.35);
    const ry = o.size * (0.7 + r() * 0.3);
    const x = rx + 20 + r() * (W - 2 * rx - 40);
    const y = ry + 20 + r() * (H - 2 * ry - 100);
    if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.rx + rx) * 0.95)) continue;
    placed.push({ x, y, rx, ry, rot: r() * 180 });
  }

  const dot = Math.max(3, o.size * 0.075);
  let nuclei = "";
  let stain = "";
  let signals = "";

  placed.forEach((p, i) => {
    if (o.stainCells && o.stained?.(i)) {
      stain += `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(p.rx * 1.7).toFixed(1)}" ry="${(p.ry * 1.6).toFixed(1)}" transform="rotate(${p.rot.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})" fill="url(#stain)"/>`;
    }
    nuclei += `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${p.rx.toFixed(1)}" ry="${p.ry.toFixed(1)}" transform="rotate(${p.rot.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})" fill="url(#dapi)"/>`;
    // chromatin texture
    for (let k = 0; k < 5; k++) {
      const a = r() * Math.PI * 2;
      const d = r() * 0.6;
      nuclei += `<circle cx="${(p.x + Math.cos(a) * p.rx * d).toFixed(1)}" cy="${(p.y + Math.sin(a) * p.ry * d).toFixed(1)}" r="${(p.rx * (0.12 + r() * 0.15)).toFixed(1)}" fill="#0c1660" opacity="0.35"/>`;
    }
    for (const s of o.signals(i, r)) {
      const cx0 = p.x + (r() - 0.5) * p.rx * 0.9;
      const cy0 = p.y + (r() - 0.5) * p.ry * 0.9;
      for (let k = 0; k < s.n; k++) {
        let x, y;
        if (s.cluster) {
          x = cx0 + (r() - 0.5) * p.rx * 0.45;
          y = cy0 + (r() - 0.5) * p.ry * 0.45;
        } else {
          const a = r() * Math.PI * 2;
          const d = Math.sqrt(r()) * 0.75;
          x = p.x + Math.cos(a) * p.rx * d;
          y = p.y + Math.sin(a) * p.ry * d;
        }
        const rad = dot * (0.8 + r() * 0.5);
        signals += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(rad * 1.7).toFixed(1)}" fill="${COLORS[s.color]}" opacity="0.35"/>`;
        signals += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${COLORS[s.color]}"/>`;
      }
    }
  });

  const barPx = o.size > 100 ? 180 : 90;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<radialGradient id="dapi"><stop offset="0" stop-color="#3a52d0"/><stop offset="0.7" stop-color="#2436a8"/><stop offset="1" stop-color="#141d70" stop-opacity="0.6"/></radialGradient>
<radialGradient id="stain"><stop offset="0.45" stop-color="#3cff8a" stop-opacity="0.55"/><stop offset="1" stop-color="#3cff8a" stop-opacity="0"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="glow"><feGaussianBlur stdDeviation="0.9"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#020306"/>
<g filter="url(#soft)">${stain}</g>
<g filter="url(#soft)">${nuclei}</g>
<g filter="url(#glow)">${signals}</g>
<g font-family="Helvetica, Arial, sans-serif" fill="#e6e9f2">
<text x="28" y="${H - 34}" font-size="22">${o.label}</text>
<rect x="${W - 28 - barPx}" y="${H - 48}" width="${barPx}" height="6" fill="#e6e9f2"/>
<text x="${W - 28 - barPx / 2}" y="${H - 58}" font-size="18" text-anchor="middle">10 µm</text>
<text x="${W - 28}" y="${H - 18}" font-size="14" text-anchor="end" fill="#8790a6">SYNTHETIC DEMO IMAGE</text>
</g>
</svg>`;
}

const both = (n, color) => [{ color, n }];
const fused = (n) => [{ color: "yellow", n }];

const SETS = {
  // HER2 amplified: clusters of red HER2 signals, 2 green CEP17
  her2: (seed, zoom) => ({
    seed, label: `HER2 (red) / CEP17 (green), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 5 : 22, size: zoom ? 150 : 62,
    signals: (i, r) => [{ color: "red", n: 6 + Math.floor(r() * 6), cluster: true }, ...both(2, "green")],
  }),
  // ALK break-apart, negative: fused (yellow) signals
  alk: (seed, zoom) => ({
    seed, label: `ALK break-apart, 5′ (green) / 3′ (red), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 5 : 22, size: zoom ? 150 : 62,
    signals: (i) => (i === 3 ? [...both(1, "red"), ...both(1, "green"), ...fused(1)] : fused(2)),
  }),
  ros1: (seed, zoom) => ({
    seed, label: `ROS1 break-apart, 5′ (green) / 3′ (red), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 5 : 20, size: zoom ? 150 : 62,
    signals: () => fused(2),
  }),
  // UroVysion: CEP3 red, CEP7 green, CEP17 aqua, 9p21 gold; some cells polysomic
  uro: (seed, zoom) => ({
    seed, label: `CEP3 (red), CEP7 (green), CEP17 (aqua), 9p21 (gold), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 4 : 16, size: zoom ? 160 : 66,
    signals: (i, r) => {
      const poly = i % 3 === 0;
      const n = poly ? 3 + Math.floor(r() * 2) : 2;
      return [...both(n, "red"), ...both(n, "green"), ...both(poly ? 3 : 2, "aqua"), ...both(2, "gold")];
    },
  }),
  // Lymphoma break-apart panel, negative
  lym: (seed, zoom) => ({
    seed, label: `BCL2 break-apart (red / green), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 6 : 26, size: zoom ? 135 : 55,
    signals: () => fused(2),
  }),
  // Melanoma 4-probe, normal copy numbers
  mel: (seed, zoom) => ({
    seed, label: `RREB1 (red), MYB (gold), CCND1 (green), CEP6 (aqua), ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 5 : 20, size: zoom ? 145 : 60,
    signals: () => [...both(2, "red"), ...both(2, "gold"), ...both(2, "green"), ...both(2, "aqua")],
  }),
  // BCR-ABL1 dual fusion: some cells carry fusion (yellow) signals
  bcr: (seed, zoom) => ({
    seed, label: `BCR (green) / ABL1 (red) dual fusion, ${zoom ? "100×" : "40×"}`,
    nuclei: zoom ? 6 : 28, size: zoom ? 125 : 50,
    signals: (i) =>
      i % 9 === 4
        ? [...both(1, "red"), ...both(1, "green"), ...fused(2)]
        : [...both(2, "red"), ...both(2, "green")],
  }),
  // Sentinel node immunofluorescence (cytokeratin, green): negative, no stained cells
  sln: (seed, zoom) => ({
    seed, label: `Cytokeratin (green), DAPI (blue), ${zoom ? "63×" : "20×"}`,
    nuclei: zoom ? 14 : 60, size: zoom ? 80 : 34,
    signals: () => [], stainCells: true, stained: () => false,
  }),
};

let count = 0;
for (const [name, make] of Object.entries(SETS)) {
  [false, true].forEach((zoom, k) => {
    const svg = image(make(name.length * 1000 + k * 77 + 11, zoom));
    writeFileSync(new URL(`${name}-${k + 1}.svg`, OUT), svg);
    count++;
  });
}
console.log(`Wrote ${count} images to public/demo-images/`);
