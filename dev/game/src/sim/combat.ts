// Бой: дистанции, нанесение урона, снаряды.
import { G } from '../core/state';
import { dist } from '../core/iso';
import { unitStat } from './economy';
import { removeBuilding } from './entities';
import { flashHit } from './effects';
import { sfx } from '../audio/sfx';
import type { Building, Entity, ResourceNode, Side, Unit, UnitStat } from '../core/types';

export function attackReach(st: UnitStat, t: Entity): number {
  return st.range + (t.kind === 'building' ? (t.size || 1) * 0.5 + 0.4 : 0.65);
}

// расстояние от юнита до цели (для зданий — до ближайшей грани)
export function unitTargetDist(u: { gx: number; gy: number }, t: Entity): number {
  if (t.kind === 'building') {
    const dx = Math.max(t.ox - u.gx, 0, u.gx - (t.ox + t.size - 1));
    const dy = Math.max(t.oy - u.gy, 0, u.gy - (t.oy + t.size - 1));
    return Math.hypot(dx, dy);
  }
  const tx = (t as ResourceNode | Unit).gx, ty = (t as ResourceNode | Unit).gy;
  return dist(u.gx, u.gy, tx, ty);
}

export function acquireEnemy(u: Unit, radius: number): Unit | null {
  const foe: Side = u.side === 'player' ? 'enemy' : 'player';
  let best: Unit | null = null, bd = radius;
  for (const o of G.units) if (o.side === foe && o.hp > 0) { const d = dist(u.gx, u.gy, o.gx, o.gy); if (d < bd) { bd = d; best = o; } }
  return best;
}

export function doAttack(u: Unit, t: Entity, st: UnitStat) {
  const dmgTgt = t as Unit | Building;
  if (st.projectile) {
    G.projectiles.push({ x: u.gx, y: u.gy, target: dmgTgt, dmg: st.dmg, speed: 11, from: u.side });
  } else {
    applyDamage(dmgTgt, st.dmg, u);
  }
  u.anim = 0; u._lunge = 1; if (Math.random() < 0.2) sfx('hit');
  if (!st.projectile) flashHit(t);
}

export function applyDamage(t: Unit | Building, dmg: number, src: Unit | null) {
  let d = dmg;
  if (t.kind === 'unit') { const ts = unitStat(t); d = Math.max(1, dmg - ts.armor); t._hurt = 0.35; }
  if (t.kind === 'building' && src && src.def && (src.def as any).siege) d += (src.def as any).siege * 3;
  t.hp -= d;
  if (t.kind === 'building' && t.hp <= 0) removeBuilding(t as Building);
}

export function updateProjectiles(dt: number) {
  for (const p of G.projectiles) {
    const t = p.target;
    if (!t || t.hp <= 0) { p.dead = true; continue; }
    const tx = (t as any).gx ?? (t as Building).cx, ty = (t as any).gy ?? (t as Building).cy;
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (d < 0.4) { applyDamage(t, p.dmg, null); flashHit(t); p.dead = true; }
    else { p.x += dx / d * p.speed * dt; p.y += dy / d * p.speed * dt; }
  }
  G.projectiles = G.projectiles.filter(p => !p.dead);
}
