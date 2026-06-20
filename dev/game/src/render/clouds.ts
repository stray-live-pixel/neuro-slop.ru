// Дрейфующие тени облаков на земле — мягкие тёмные пятна, медленно ползущие по
// карте. Дают игру света и ощущение объёма «под открытым небом», убирая плоскость.
// Рисуются под объектами; гасятся при prefers-reduced-motion.
import { iso } from '../core/iso';
import { MAP } from '../data/config';
import { G } from '../core/state';
import { R } from './context';

let reduced = false;
try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* SSR/old */ }

// габариты мира в экранных координатах (по четырём углам карты)
const cs = [iso(0, 0), iso(MAP.W, 0), iso(0, MAP.H), iso(MAP.W, MAP.H)];
const minX = Math.min(...cs.map(c => c.x)), maxX = Math.max(...cs.map(c => c.x));
const minY = Math.min(...cs.map(c => c.y)), maxY = Math.max(...cs.map(c => c.y));
const wX = maxX - minX, wY = maxY - minY;

// f — доля по вертикали, o — фазовый сдвиг, s — относительная скорость, r — радиус
const CLOUDS = [
  { f: 0.16, o: 0.00, s: 1.00, r: 0.24 },
  { f: 0.42, o: 0.45, s: 0.78, r: 0.30 },
  { f: 0.66, o: 0.78, s: 1.18, r: 0.21 },
  { f: 0.88, o: 0.22, s: 0.90, r: 0.27 },
];

export function updateClouds() {
  const g = R.cloudG;
  g.clear();
  if (reduced) return;
  const t = G.time;
  for (const c of CLOUDS) {
    const rx = wX * c.r, ry = rx * 0.4;
    const travel = wX + rx * 2;
    const x = minX - rx + ((t * 16 * c.s + c.o * travel) % travel);
    const y = minY + wY * c.f;
    g.ellipse(x, y, rx, ry).fill({ color: 0x2a3320, alpha: 0.05 });
    g.ellipse(x, y, rx * 0.66, ry * 0.7).fill({ color: 0x2a3320, alpha: 0.055 });
  }
}
