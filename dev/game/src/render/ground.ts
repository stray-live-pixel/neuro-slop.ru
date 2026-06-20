// Изометрическая «карандашная» земля: органичные пятна луга (value-noise),
// мягкий направленный свет и редкий декор (трава, цветы, камешки, проплешины).
// Строится один раз — статичный меш, дёшево рисуется каждый кадр.
import { iso } from '../core/iso';
import { MAP, TILE } from '../data/config';
import { R } from './context';

// Подмешать тон к белому (f>0, свет) или к чёрному (f<0, тень).
function shade(hex: number, f: number): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const to = f >= 0 ? 255 : 0, k = Math.min(1, Math.abs(f));
  const mix = (c: number) => Math.round(c + (to - c) * k);
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}
function lerpCol(a: number, b: number, t: number): number {
  const m = (sh: number) => Math.round(((a >> sh) & 255) + (((b >> sh) & 255) - ((a >> sh) & 255)) * t);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}
// Детерминированный хеш и сглаженный value-noise (0..1) — органичные пятна луга.
function hash2(x: number, y: number): number {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const LUSH = 0xa6c178, DRY = 0xc8c98a;   // палитра луга: сочная зелень ↔ суховатая

export function buildGround() {
  const g = R.groundG;
  g.clear();
  const TW2 = TILE.w / 2, TH2 = TILE.h / 2;
  const span = MAP.W + MAP.H - 2;
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const p = iso(x, y);
    const region = noise(x / 9, y / 9);            // крупные пятна
    const fine = noise(x / 3.2 + 13, y / 3.2 + 7); // средняя вариация
    let tone = lerpCol(LUSH, DRY, region * 0.7 + fine * 0.3);
    tone = shade(tone, (hash2(x * 7 + 1, y * 13 + 3) - 0.5) * 0.05);  // микро-джиттер
    // мягкий направленный свет: дальний (верхний) край ярче, ближний — темнее
    const lf = 0.06 - (x + y) / span * 0.16;
    tone = shade(tone, lf);
    const top = shade(tone, 0.07);                 // блик по верхним граням ромба
    g.poly([p.x, p.y - TH2, p.x + TW2, p.y, p.x, p.y + TH2, p.x - TW2, p.y], true)
      .fill(tone).stroke({ width: 1, color: 0x586741, alpha: 0.34 });
    g.moveTo(p.x - TW2, p.y).lineTo(p.x, p.y - TH2).lineTo(p.x + TW2, p.y)
      .stroke({ width: 1, color: top, alpha: 0.5 });
  }

  // ----- декор: плотность завязана на noise, чтобы зоны отличались -----
  let seed = 1234;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // мягкие земляные проплешины в сухих зонах
  for (let i = 0; i < 30; i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (noise(gx / 9, gy / 9) < 0.55) continue;
    const p = iso(gx, gy), rw = TILE.w * (0.45 + rnd() * 0.7);
    g.ellipse(p.x, p.y, rw, rw * 0.5).fill({ color: 0xb3a878, alpha: 0.13 });
  }

  // трава пучками — гуще в «зелёных» зонах
  for (let i = 0; i < 2400; i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    const lush = 1 - noise(gx / 9, gy / 9);
    if (rnd() > 0.22 + lush * 0.62) continue;
    const p = iso(gx, gy);
    g.moveTo(p.x, p.y).lineTo(p.x - 2, p.y - 5);
    g.moveTo(p.x + 2, p.y).lineTo(p.x + 3, p.y - 6);
    g.moveTo(p.x - 1, p.y).lineTo(p.x + 1, p.y - 4);
  }
  g.stroke({ width: 1.2, color: 0x82a05f, alpha: 0.5 });

  // редкие цветочки в зелёных зонах
  for (let i = 0; i < 140; i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (noise(gx / 9, gy / 9) > 0.5) continue;
    const p = iso(gx, gy);
    const col = rnd() < 0.5 ? 0xf4f0d8 : (rnd() < 0.5 ? 0xf2d65a : 0xe9e2f1);
    g.circle(p.x, p.y - 2, 1.5).fill({ color: col, alpha: 0.85 });
  }

  // камешки в сухих зонах
  for (let i = 0; i < 110; i++) {
    const gx = rnd() * MAP.W, gy = rnd() * MAP.H;
    if (noise(gx / 9, gy / 9) < 0.55) continue;
    const p = iso(gx, gy);
    g.ellipse(p.x, p.y, 2.2, 1.3).fill({ color: 0x9a9486, alpha: 0.5 });
  }
}
