// Здания: производство/исследования в очереди, авто-стрельба башен.
import { G } from '../core/state';
import { clamp, inBounds } from '../core/iso';
import { MAP } from '../data/config';
import { TECHS } from '../data/techs';
import { unitTargetDist } from './combat';
import { spawnUnit, recalcPop } from './entities';
import { gatherOrder, moveOrder, nearestNode } from './commands';
import { buildDust } from './effects';
import { sfx } from '../audio/sfx';
import { toast } from '../ui/toast';
import { renderPanel } from '../ui/panel';
import type { Building, Unit } from '../core/types';

export function updateBuilding(b: Building, dt: number) {
  b.anim += dt;
  if (b.progress < 1) return;
  // башня — авто-стрельба
  if (b.def.attack) {
    b.cd = (b.cd || 0) - dt;
    const range = b.def.attack.range + G.up.towerRange;
    let best: Unit | null = null, bd = range;
    const center = { gx: b.cx, gy: b.cy };
    for (const u of G.units) if (u.side === 'enemy') { const d = unitTargetDist(center, u); if (d < bd) { bd = d; best = u; } }
    if (best && b.cd <= 0) {
      G.projectiles.push({ x: b.cx, y: b.cy, target: best, dmg: b.def.attack.dmg + G.up.towerDmg, speed: 12, from: 'player' });
      b.cd = b.def.attack.rate;
    }
  }
  // очередь производства/исследования
  if (b.queue.length) {
    const j = b.queue[0]; j.t += dt;
    if (j.t >= j.total) {
      b.queue.shift();
      if (j.kind === 'unit') { spawnFromBuilding(b, j.id); sfx('train'); }
      else {
        G.researched.add(j.id); TECHS[j.id].apply(G);
        toast('Изучено: ' + TECHS[j.id].name); sfx('done');
        if (G.selection.includes(b)) renderPanel();
      }
    }
  }
}

export function spawnFromBuilding(b: Building, type: string) {
  let sx = b.ox + (b.size >> 1), sy = b.oy + b.size;
  for (let r = 0; r < 6 && (!inBounds(sx, sy) || G.solid[sy][sx]); r++) { sx = b.ox + (r % b.size); sy = b.oy + b.size + ((r / b.size) | 0); }
  const u = spawnUnit(type, clamp(sx, 0, MAP.W - 1), clamp(sy, 0, MAP.H - 1), 'player');
  const r = b.rally;
  if (r) { if (r.node && r.node.amount > 0 && type === 'peasant') gatherOrder(u, r.node); else moveOrder(u, r.x, r.y); }
  else if (type === 'peasant') { const n = nearestNode(u); if (n) gatherOrder(u, n); }
}

export function onBuildComplete(b: Building) {
  toast(b.def.name + ' построена'); sfx('done');
  buildDust(b);
  recalcPop();
  if (G.selection.includes(b)) renderPanel();
}
