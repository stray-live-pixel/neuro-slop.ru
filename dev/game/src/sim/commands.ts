// Приказы юнитам и обработка правого клика/тапа по миру.
import { G } from '../core/state';
import { dist, clamp, inBounds } from '../core/iso';
import { pickTile } from '../core/grid';
import { MAP } from '../data/config';
import { BUILDINGS } from '../data/buildings';
import { findPath, pathToNear, pathToNearTile } from './pathfind';
import { flash } from './effects';
import { sfx } from '../audio/sfx';
import { toast } from '../ui/toast';
import type { Building, Entity, ResourceNode, Unit } from '../core/types';

export function moveOrder(u: Unit, gx: number, gy: number) {
  const p = findPath(u.gx, u.gy, gx, gy, false) || pathToNearTile(u.gx, u.gy, gx, gy);
  u.order = { type: 'move' }; u.path = p; u.wp = 0;
  u.guard = { x: gx | 0, y: gy | 0 };
}
export function gatherOrder(u: Unit, node: ResourceNode) {
  u.order = { type: 'gather', target: node };
  u.path = pathToNear(u.gx, u.gy, node); u.wp = 0;
}
export function buildOrder(u: Unit, b: Building) {
  u.order = { type: 'build', target: b };
  u.path = pathToNear(u.gx, u.gy, b); u.wp = 0;
}
export function attackOrder(u: Unit, t: Entity, forced?: boolean) {
  u.order = { type: 'attack', target: t, forced: !!forced };
  u.path = pathToNear(u.gx, u.gy, t); u.wp = 0;
  if (forced) u.guard = { x: u.gx | 0, y: u.gy | 0 };
}

export function faceTo(u: Unit, t: Entity) {
  const tx = (t as any).gx ?? (t as Building).cx;
  u.vx = (tx - u.gx) >= 0 ? 1 : -1;
}
export function returnToGuard(u: Unit) {
  if (dist(u.gx, u.gy, u.guard.x, u.guard.y) > 1.2) moveOrder(u, u.guard.x, u.guard.y);
}
export function nearestNode(u: Unit, kind?: string): ResourceNode | null {
  let best: ResourceNode | null = null, bd = 14;
  for (const n of G.nodes) if (!kind || n.node === kind) { const d = dist(u.gx, u.gy, n.gx, n.gy); if (d < bd) { bd = d; best = n; } }
  return best;
}

export function moveFormation(units: Unit[], wx: number, wy: number) {
  const n = units.length, cols = Math.ceil(Math.sqrt(n)); let i = 0;
  units.forEach(u => {
    const ox = (i % cols) - (cols - 1) / 2, oy = ((i / cols) | 0) - (cols - 1) / 2; i++;
    moveOrder(u, clamp(wx + ox, 0, MAP.W - 1), clamp(wy + oy, 0, MAP.H - 1));
  });
}

// ближайший враг рядом с точкой клика
export function enemyAt(wx: number, wy: number): Unit | null {
  let best: Unit | null = null, bd = 1.4;
  for (const u of G.units) if (u.side === 'enemy') { const d = dist(u.gx, u.gy, wx, wy); if (d < bd) { bd = d; best = u; } }
  return best;
}

// умный приказ выделению по клику правой кнопкой / тапу-команде
export function commandSelection(wx: number, wy: number) {
  const tile = pickTile(wx, wy);
  const players = G.selection.filter((s): s is Unit => s.kind === 'unit' && s.side === 'player');
  // производящее здание без выбранных юнитов — задаём точку сбора
  const bsel = G.selection.find(s => s.kind === 'building') as Building | undefined;
  if (bsel && players.length === 0) {
    bsel.rally = { x: wx, y: wy, node: tile && tile.kind === 'node' ? tile : null };
    toast('Точка сбора назначена'); sfx('click'); return;
  }
  if (players.length === 0) return;
  sfx('command');
  const foe = enemyAt(wx, wy);
  if (foe) { players.forEach(u => attackOrder(u, foe, true)); flash(foe.gx, foe.gy, '#ff5a4a'); return; }
  if (tile && tile.kind === 'node') {
    players.forEach(u => u.type === 'peasant' ? gatherOrder(u, tile) : moveOrder(u, tile.gx, tile.gy));
    flash(tile.gx, tile.gy, '#7ec85a');
  } else if (tile && tile.kind === 'building' && (tile as any).side === undefined && BUILDINGS[tile.key]) {
    if (tile.progress < 1) players.forEach(u => u.type === 'peasant' ? buildOrder(u, tile) : moveOrder(u, tile.cx, tile.cy));
    else players.forEach(u => moveOrder(u, tile.cx, tile.cy));
    flash(tile.cx, tile.cy, '#cfa14a');
  } else {
    moveFormation(players, wx, wy);
    flash(wx, wy, '#6fb0ff');
  }
}

export { inBounds };
