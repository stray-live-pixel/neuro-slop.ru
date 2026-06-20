// Порождение визуальных эффектов в data-массивы G.fx / G.particles.
// Симуляция вызывает flash/flashHit; рендер — spawnWorkParticle/spawnSmoke.
import { G } from '../core/state';
import { iso } from '../core/iso';
import { TILE } from '../data/config';
import type { Building, Entity } from '../core/types';

export function flash(x: number, y: number, color: string) {
  G.fx.push({ x, y, t: 0, life: 0.45, type: 'flash', color });
}

export function spawnHit(wx: number, wy: number) {
  for (let i = 0; i < 6; i++) G.particles.push({
    x: wx, y: wy, vx: (Math.random() - 0.5) * 90, vy: -30 - Math.random() * 70,
    life: 0, max: 0.4, size: 2, color: 0xffe08a, grav: 170,
  });
}

export function flashHit(t: Entity) {
  const x = (t as any).gx ?? (t as Building).cx, y = (t as any).gy ?? (t as Building).cy;
  G.fx.push({ x, y, t: 0, life: 0.25, type: 'hit' });
  const p = iso(x, y); spawnHit(p.x, p.y - 14);
}

export function spawnWorkParticle(u: { gx: number; gy: number }, act: string) {
  const p = iso(u.gx, u.gy);
  const col = act === 'chop' ? 0x8a5a2a : act === 'mine' ? 0x9aa0a6 : act === 'farm' ? 0xd6c24a : 0xcaa24a;
  for (let i = 0; i < 2; i++) G.particles.push({
    x: p.x + (Math.random() - 0.5) * 12, y: p.y - TILE.h * 0.2,
    vx: (Math.random() - 0.5) * 34, vy: -22 - Math.random() * 32,
    life: 0, max: 0.5, size: 2 + Math.random() * 2, color: col, grav: 130,
  });
}

export function spawnSmoke(x: number, y: number) {
  G.particles.push({
    x, y, vx: (Math.random() - 0.5) * 8, vy: -16 - Math.random() * 10,
    life: 0, max: 1.7, size: 4 + Math.random() * 4, color: 0x9a948c, grav: -5, smoke: true,
  });
}

export function buildDust(b: Building) {
  const base = iso(b.cx, b.cy);
  for (let i = 0; i < 10; i++) G.particles.push({
    x: base.x + (Math.random() - 0.5) * TILE.w * b.size * 0.5, y: base.y,
    vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 40,
    life: 0, max: 0.6, size: 2 + Math.random() * 2, color: 0xd8c79a, grav: 150,
  });
}
