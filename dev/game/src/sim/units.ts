// Поведение юнитов: движение, добыча, стройка, бой и ИИ орды.
import { G } from '../core/state';
import { dist } from '../core/iso';
import { REACH } from '../data/config';
import { unitStat, gatherMult } from './economy';
import { removeNode } from './entities';
import { acquireEnemy, doAttack, attackReach, unitTargetDist } from './combat';
import { attackOrder, moveOrder, returnToGuard, faceTo, gatherOrder, farmOrder, buildOrder, nearestNode, advanceOrder, nearestUnbuilt } from './commands';
import { pathToNear } from './pathfind';
import { onBuildComplete } from './buildings';
import { recalcPop } from './entities';
import type { Building, Entity, ResKey, Unit, UnitStat } from '../core/types';

export function moveAlong(u: Unit, dt: number, speed: number): boolean {
  if (!u.path || u.wp >= u.path.length) return true;
  const w = u.path[u.wp];
  const dx = w.x - u.gx, dy = w.y - u.gy, d = Math.hypot(dx, dy);
  const step = speed * dt;
  if (d <= step) {
    u.gx = w.x; u.gy = w.y; u.wp++;
    if (Math.abs(dx) > 0.01) u.vx = Math.sign(dx - dy) || u.vx;
    return u.wp >= u.path.length;
  }
  u.gx += dx / d * step; u.gy += dy / d * step;
  if (Math.abs(dx) > 0.001) u.vx = (dx - dy) >= 0 ? 1 : -1;
  return false;
}

// Чем заняться крестьянину после стройки: сперва отложенные приказы (Shift-очередь),
// затем — ближайшее ещё не достроенное здание на карте, иначе встать без дела.
function nextBuildTask(u: Unit) {
  if (u.queue.length) { advanceOrder(u); return; }
  const nb = nearestUnbuilt(u);
  if (nb) buildOrder(u, nb); else u.order = null;
}

export function updateUnit(u: Unit, dt: number) {
  u.cd -= dt; u.anim += dt;
  const st = unitStat(u);
  if (st.hpBonus && u.maxhp === u.def.hp) { u.maxhp += st.hpBonus; u.hp += st.hpBonus; } // дружина: разовый буст HP
  const o = u.order;

  if (u.side === 'enemy') { enemyAI(u, dt, st); return; }

  if (!o) { // простой: воины защищаются автоматически
    if (u.type !== 'peasant') {
      const e = acquireEnemy(u, 9);
      if (e) attackOrder(u, e, false);
    }
    return;
  }

  if (o.type === 'move') { if (moveAlong(u, dt, st.speed)) advanceOrder(u); return; }

  if (o.type === 'gather') {
    const node = o.target as any;
    // поле (farm-здание): бесконечная еда, узел не истощается
    if (node && node.kind === 'building') {
      if (!G.buildings.includes(node) || node.progress < 1) { u.gatherRes = null; advanceOrder(u); return; }
      if (unitTargetDist(u, node) <= REACH) {
        u.path = null; u.gatherRes = 'food';
        G.res.food += (u.def.gather || 0) * gatherMult('food') * dt * 0.8;
      } else if (moveAlong(u, dt, st.speed)) { u.path = pathToNear(u.gx, u.gy, node, true); u.wp = 0; }
      return;
    }
    if (!node || node.amount <= 0) {
      u.gatherRes = null;
      if (u.queue.length) { advanceOrder(u); return; }           // есть отложенные приказы — к ним
      const nx = nearestNode(u, node && node.node);              // иначе сам перейдёт на ближайший такой же
      if (nx) gatherOrder(u, nx); else u.order = null;
      return;
    }
    if (unitTargetDist(u, node) <= REACH) {
      u.path = null; u.gatherRes = node.res as ResKey;
      const amt = (u.def.gather || 0) * gatherMult(node.res) * dt;
      const take = Math.min(amt, node.amount); node.amount -= take; G.res[node.res as ResKey] += take;
      if (node.amount <= 0) removeNode(node);
    } else if (moveAlong(u, dt, st.speed)) { u.path = pathToNear(u.gx, u.gy, node, true); u.wp = 0; }
    return;
  }

  if (o.type === 'build') {
    const b = o.target as any;
    if (!b || b.progress >= 1 || !G.buildings.includes(b)) { nextBuildTask(u); return; }  // цель уже готова/снесена — к следующей
    if (unitTargetDist(u, b) <= REACH) {
      u.path = null;
      b.progress = Math.min(1, b.progress + (1 / b.def.build) * (u.def.build || 1) * dt);
      b.hp = Math.max(b.hp, b.maxhp * b.progress);
      // достроено: поле без очереди — жнём; иначе идём по очереди / к следующей стройке
      if (b.progress >= 1) { b.hp = b.maxhp; recalcPop(); onBuildComplete(b); if (b.def.farm && !u.queue.length) farmOrder(u, b); else nextBuildTask(u); }
    } else if (moveAlong(u, dt, st.speed)) { u.path = pathToNear(u.gx, u.gy, b, true); u.wp = 0; }
    return;
  }

  if (o.type === 'attack') {
    const t = o.target as Unit | Building;
    if (!t || t.hp <= 0 || (t.kind === 'building' && !G.buildings.includes(t)) || (t.kind === 'unit' && !G.units.includes(t))) {
      if (u.queue.length) { advanceOrder(u); return; }   // цель повержена — к следующему приказу
      u.order = null;
      if (!o.forced) { const e = acquireEnemy(u, 9); if (e) attackOrder(u, e, false); else returnToGuard(u); }
      return;
    }
    const reach = attackReach(st, t);
    if (unitTargetDist(u, t) <= reach) {
      u.path = null; faceTo(u, t);
      if (u.cd <= 0) { doAttack(u, t, st); u.cd = st.rate; }
    } else {
      if (!o.forced && dist(u.gx, u.gy, u.guard.x, u.guard.y) > 11) { u.order = null; returnToGuard(u); return; }
      if (moveAlong(u, dt, st.speed)) { u.path = pathToNear(u.gx, u.gy, t, true); u.wp = 0; }
    }
    return;
  }
}

/* ------------------------------ враги (ИИ) -------------------------------- */
export function enemyAI(u: Unit, dt: number, st: UnitStat) {
  const o = u.order;
  if (!o || !o.target || (o.target as Unit | Building).hp <= 0 ||
      (o.target.kind === 'building' && !G.buildings.includes(o.target)) ||
      (o.target.kind === 'unit' && !G.units.includes(o.target))) {
    pickEnemyTarget(u); return;
  }
  const t = o.target;
  const reach = attackReach(st, t);
  if (unitTargetDist(u, t) <= reach) {
    u.path = null; faceTo(u, t); if (u.cd <= 0) { doAttack(u, t, st); u.cd = st.rate; }
  } else {
    if (moveAlong(u, dt, st.speed)) {
      const p = pathToNear(u.gx, u.gy, t);
      if (p) { u.path = p; u.wp = 0; } else { o.repath = (o.repath || 0) + 1; if (o.repath > 2) pickEnemyTarget(u); }
    }
    // по пути бьём подвернувшихся защитников
    const near = acquireEnemy(u, 1.6);
    if (near && near !== t) { u.path = null; faceTo(u, near); if (u.cd <= 0) { doAttack(u, near, st); u.cd = st.rate; } }
  }
}

export function pickEnemyTarget(u: Unit) {
  const cands: Entity[] = [...G.units.filter(x => x.side === 'player'), ...G.buildings];
  cands.sort((a, b) => unitTargetDist(u, a) - unitTargetDist(u, b));
  for (const c of cands.slice(0, 8)) {
    const p = pathToNear(u.gx, u.gy, c as any);
    if (p) { u.order = { type: 'attack', target: c }; u.path = p; u.wp = 0; return; }
  }
  if (cands.length) {
    const c = cands[0];
    u.order = { type: 'attack', target: c }; u.path = pathToNear(u.gx, u.gy, c as any); u.wp = 0;
  }
}

/* --------------------------- что делает юнит ------------------------------ */
export function unitAction(u: Unit, arrived: boolean): string {
  const o = u.order; if (!o) return 'idle';
  if (o.type === 'move') return 'move';
  if (!arrived) return 'move';
  if (o.type === 'gather') return u.gatherRes === 'wood' ? 'chop' : u.gatherRes === 'food' ? 'farm' : (u.gatherRes ? 'mine' : 'move');
  if (o.type === 'build') return 'build';
  if (o.type === 'attack') return 'fight';
  return 'idle';
}
export function badgeFor(act: string): string | null {
  // имена соответствуют иконкам lucide (food = колос); fix бага: ферма раньше ссылалась на несуществующий 'wheat'
  return ({ chop: 'axe', mine: 'pickaxe', farm: 'food', build: 'hammer', fight: 'swords' } as Record<string, string>)[act] || null;
}
