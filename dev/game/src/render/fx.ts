// Частицы, снаряды (стрелы) и вспышки — один Graphics в мировом пространстве.
import type { Graphics } from 'pixi.js';
import { iso, colHex } from '../core/iso';
import { G } from '../core/state';
import { R } from './context';
import { orderChainMarkers } from './moveOrders';
import type { Building } from '../core/types';

interface Pt { x: number; y: number; }

const DASH_EPS = 1e-4;

export function dashedPolylineSegments(pts: Pt[], dash: number, gap: number, phase: number): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  const period = dash + gap;
  if (!Number.isFinite(period) || period <= 0 || dash <= 0) return out;

  let d0 = 0;                                          // дистанция от начала ломаной до точки a
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    if (!Number.isFinite(L) || L < 1e-3) continue;
    const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
    let d = d0; const end = d0 + L;
    let guard = 0;
    while (d < end - 1e-6 && guard++ < 10000) {
      const m = (((d - phase) % period) + period) % period;   // позиция внутри периода
      const on = m < dash;
      const advance = on ? dash - m : period - m;
      if (advance <= DASH_EPS) { d = Math.min(end, d + DASH_EPS); continue; }
      const segEnd = Math.min(end, d + advance);
      if (on) {
        out.push([
          { x: a.x + ux * (d - d0), y: a.y + uy * (d - d0) },
          { x: a.x + ux * (segEnd - d0), y: a.y + uy * (segEnd - d0) },
        ]);
      }
      d = segEnd;
    }
    d0 = end;
  }
  return out;
}

// Пунктир «бегущая дорожка» вдоль ломаной (мировые координаты). Фаза сдвигается со
// временем, штрихи плывут к назначению. Копит штрихи в текущий путь Graphics — стробится
// одним вызовом stroke() снаружи.
function dashedPolyline(g: Graphics, pts: Pt[], dash: number, gap: number, phase: number) {
  for (const [a, b] of dashedPolylineSegments(pts, dash, gap, phase)) g.moveTo(a.x, a.y).lineTo(b.x, b.y);
}

export function drawFx(dt: number) {
  const g = R.fxG; g.clear();

  // частицы (физика + отрисовка)
  for (const pa of G.particles) {
    pa.life += dt; pa.x += pa.vx * dt; pa.y += pa.vy * dt; pa.vy += pa.grav * dt;
    const k = pa.life / pa.max; if (k >= 1) { pa.dead = true; continue; }
    g.circle(pa.x, pa.y, pa.size * (pa.smoke ? 1 + k * 1.6 : 1)).fill({ color: pa.color, alpha: pa.smoke ? 0.4 * (1 - k) : 1 - k });
  }
  G.particles = G.particles.filter(p => !p.dead);

  // снаряды (стрелы) — единым штрихом
  let anyProj = false;
  for (const p of G.projectiles) {
    const tgt = p.target as any; if (!tgt) continue;
    const a = iso(p.x, p.y), b = iso(tgt.gx ?? (tgt as Building).cx, tgt.gy ?? (tgt as Building).cy);
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    g.moveTo(a.x, a.y - 14).lineTo(a.x + dx / d * 13, a.y - 14 + dy / d * 13);
    anyProj = true;
  }
  if (anyProj) g.stroke({ width: 2.4, color: 0x4a3318, alpha: 0.95 });

  // вспышки/удары/смерти/обрушения
  for (const f of G.fx) {
    const s = iso(f.x, f.y); const k = f.t / f.life;
    if (f.type === 'flash') g.ellipse(s.x, s.y, (1 - k) * 26, (1 - k) * 13).stroke({ width: 2.4, color: colHex(f.color || '#ffffff'), alpha: 1 - k });
    else if (f.type === 'hit') g.circle(s.x, s.y - 14, 3 + k * 6).fill({ color: 0xffe08a, alpha: 1 - k });
    else if (f.type === 'die') g.circle(s.x, s.y, 6 + k * 16).fill({ color: 0x7a2018, alpha: (1 - k) * 0.5 });
    else if (f.type === 'collapse') g.circle(s.x, s.y, 10 + k * 46).fill({ color: 0x3c3228, alpha: (1 - k) * 0.6 });
  }

  // флажки точек сбора у выделенных производящих зданий
  for (const sel of G.selection) {
    if (sel.kind !== 'building' || !(sel as Building).rally) continue;
    const b = sel as Building, r = b.rally!;
    const a = iso(b.cx, b.cy), p = iso(r.x, r.y);
    g.moveTo(a.x, a.y).lineTo(p.x, p.y).stroke({ width: 1.4, color: 0xffe07a, alpha: 0.35 });
    g.moveTo(p.x, p.y).lineTo(p.x, p.y - 22).stroke({ width: 2, color: 0xf3e6bc, alpha: 0.95 });
    g.poly([p.x, p.y - 22, p.x + 13, p.y - 18.5, p.x, p.y - 15], true).fill({ color: 0xffce42, alpha: 0.95 });
    g.ellipse(p.x, p.y, 4, 2).fill({ color: 0xffce42, alpha: 0.85 });
  }

  // цепочка приказов выделенных юнитов: маршрут + флажки (текущий приказ и вся очередь Shift)
  const chains = orderChainMarkers(G.selection);
  if (chains.length) {
    const phase = G.time * 26;                          // px/сек — пунктир «течёт» к цели
    // мягкая подложка-дорожка (один штрих по всем маршрутам)
    for (const m of chains) dashedPolyline(g, m.points.map(p => iso(p.x, p.y)), 9, 7, phase);
    g.stroke({ width: 5, color: 0x6fb0ff, alpha: 0.14 });
    for (const m of chains) dashedPolyline(g, m.points.map(p => iso(p.x, p.y)), 9, 7, phase);
    g.stroke({ width: 1.8, color: 0xbfe0ff, alpha: 0.7 });
    // флажок в каждой точке назначения цепочки
    for (const m of chains) for (const f of m.flags) {
      const p = iso(f.x, f.y);
      g.ellipse(p.x, p.y, 4, 2).fill({ color: 0x6fb0ff, alpha: 0.8 });
      g.moveTo(p.x, p.y).lineTo(p.x, p.y - 22).stroke({ width: 2, color: 0xeaf2ff, alpha: 0.95 });
      g.poly([p.x, p.y - 22, p.x + 13, p.y - 18.5, p.x, p.y - 15], true).fill({ color: 0x6fb0ff, alpha: 0.95 });
    }
  }
}
