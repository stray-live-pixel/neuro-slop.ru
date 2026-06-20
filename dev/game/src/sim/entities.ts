// Создание/удаление сущностей и пересчёт населения.
import { G } from '../core/state';
import { markTiles } from '../core/grid';
import { MAP, MAX_POP } from '../data/config';
import { UNITS } from '../data/units';
import { BUILDINGS } from '../data/buildings';
import { NODES } from '../data/nodes';
import { deselect } from '../input/selection';
import type { Building, ResourceNode, Side, Unit } from '../core/types';

export function spawnUnit(type: string, gx: number, gy: number, side?: Side): Unit {
  const d = UNITS[type];
  const u: Unit = {
    id: G.uid++, kind: 'unit', type, side: side || d.side, name: d.name,
    gx, gy, vx: 1, hp: d.hp, maxhp: d.hp, def: d,
    order: null, path: null, wp: 0, cd: 0, anim: 0,
    guard: { x: gx, y: gy },
    gatherRes: null, carry: 0,
  };
  G.units.push(u);
  return u;
}

export function placeBuilding(key: string, ox: number, oy: number, built: boolean): Building {
  const d = BUILDINGS[key];
  const b: Building = {
    id: G.uid++, kind: 'building', key, name: d.name, def: d,
    ox, oy, size: d.size, cx: ox + (d.size - 1) / 2, cy: oy + (d.size - 1) / 2,
    hp: built ? d.hp : 1, maxhp: d.hp, progress: built ? 1 : 0,
    queue: [], cd: 0, rally: null, anim: 0,
  };
  markTiles(b, ox, oy, d.size, true);
  G.buildings.push(b);
  if (d.provides && d.provides.pop) recalcPop();
  return b;
}

export function removeBuilding(b: Building) {
  markTiles(b, b.ox, b.oy, b.size, false);
  G.buildings.splice(G.buildings.indexOf(b), 1);
  if (G.selection.includes(b)) deselect();
  recalcPop();
  G.fx.push({ x: b.cx, y: b.cy, t: 0, life: 0.7, type: 'collapse' });
}

export function addNode(kind: string, x: number, y: number): ResourceNode {
  const d = NODES[kind];
  const node: ResourceNode = {
    id: G.uid++, kind: 'node', node: kind, res: d.res, img: d.img,
    gx: x, gy: y, amount: d.amount, max: d.amount, label: d.label,
  };
  G.nodes.push(node);
  G.solid[y][x] = 1; G.tileObj[y][x] = node;
  return node;
}

export function removeNode(node: ResourceNode) {
  if (G.tileObj[node.gy][node.gx] === node) { G.solid[node.gy][node.gx] = 0; G.tileObj[node.gy][node.gx] = null; }
  G.nodes.splice(G.nodes.indexOf(node), 1);
}

export function recalcPop() {
  let cap = 0;
  G.buildings.forEach(b => { if (b.progress >= 1 && b.def.provides && b.def.provides.pop) cap += b.def.provides.pop; });
  G.pop.cap = Math.min(MAX_POP, cap);
}

// население = живые юниты игрока + зарезервированные в очередях
export function computePopUsed() {
  let u = 0;
  for (const x of G.units) if (x.side === 'player') u += x.def.pop || 0;
  for (const b of G.buildings) for (const j of b.queue) if (j.kind === 'unit') u += UNITS[j.id].pop || 0;
  G.pop.used = u;
}

export { MAP };
