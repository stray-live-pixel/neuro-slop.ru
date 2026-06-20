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
import type { Building, Entity, Order, ResourceNode, Unit } from '../core/types';

// Приказы отдаются юнитам игрока — они срезают углы (cornerCut=true), пролезая между
// зданиями. Враги строят пути отдельно (enemyAI/pickEnemyTarget) и углы не срезают.
//
// Очередь приказов (Shift). Каждый публичный приказ принимает флаг queue: если он
// поднят и у юнита уже есть чем заняться — приказ кладётся в хвост u.queue, иначе
// исполняется сразу (и очередь сбрасывается — обычный приказ заменяет план). Реальный
// старт приказа (с расчётом пути) живёт в begin*-функциях: их же дёргает advanceOrder,
// доставая следующий приказ из очереди, не трогая саму очередь.
function hasOrders(u: Unit): boolean { return !!u.order || u.queue.length > 0; }

function beginMove(u: Unit, gx: number, gy: number) {
  const p = findPath(u.gx, u.gy, gx, gy, false, true) || pathToNearTile(u.gx, u.gy, gx, gy, true);
  u.order = { type: 'move', gx: gx | 0, gy: gy | 0 }; u.path = p; u.wp = 0;
  u.guard = { x: gx | 0, y: gy | 0 };
}
function beginGather(u: Unit, node: ResourceNode) {
  u.order = { type: 'gather', target: node };
  u.path = pathToNear(u.gx, u.gy, node, true); u.wp = 0;
}
function beginBuild(u: Unit, b: Building) {
  u.order = { type: 'build', target: b };
  u.path = pathToNear(u.gx, u.gy, b, true); u.wp = 0;
}
function beginFarm(u: Unit, b: Building) {
  u.order = { type: 'gather', target: b };
  u.path = pathToNear(u.gx, u.gy, b, true); u.wp = 0;
}
function beginAttack(u: Unit, t: Entity, forced?: boolean) {
  u.order = { type: 'attack', target: t, forced: !!forced };
  u.path = pathToNear(u.gx, u.gy, t, true); u.wp = 0;
  if (forced) u.guard = { x: u.gx | 0, y: u.gy | 0 };
}

export function moveOrder(u: Unit, gx: number, gy: number, queue = false) {
  if (queue && hasOrders(u)) { u.queue.push({ type: 'move', gx: gx | 0, gy: gy | 0 }); return; }
  u.queue = []; beginMove(u, gx, gy);
}
export function gatherOrder(u: Unit, node: ResourceNode, queue = false) {
  if (queue && hasOrders(u)) { u.queue.push({ type: 'gather', target: node }); return; }
  u.queue = []; beginGather(u, node);
}
export function buildOrder(u: Unit, b: Building, queue = false) {
  if (queue && hasOrders(u)) { u.queue.push({ type: 'build', target: b }); return; }
  u.queue = []; beginBuild(u, b);
}
// крестьянин жнёт поле (farm-здание) — бесконечный источник еды
export function farmOrder(u: Unit, b: Building, queue = false) {
  if (queue && hasOrders(u)) { u.queue.push({ type: 'gather', target: b }); return; }
  u.queue = []; beginFarm(u, b);
}
export function attackOrder(u: Unit, t: Entity, forced?: boolean, queue = false) {
  if (queue && hasOrders(u)) { u.queue.push({ type: 'attack', target: t, forced: !!forced }); return; }
  u.queue = []; beginAttack(u, t, forced);
}

// перейти к следующему приказу из очереди (или встать без дела, если очередь пуста)
export function advanceOrder(u: Unit) {
  const next = u.queue.shift();
  if (!next) { u.order = null; return; }
  beginOrder(u, next);
}
function beginOrder(u: Unit, o: Order) {
  if (o.type === 'move') beginMove(u, o.gx ?? u.gx, o.gy ?? u.gy);
  else if (o.type === 'build') beginBuild(u, o.target as Building);
  else if (o.type === 'attack') beginAttack(u, o.target as Entity, o.forced);
  else {
    const t = o.target as ResourceNode | Building | undefined;
    if (t && t.kind === 'building') beginFarm(u, t); else if (t) beginGather(u, t as ResourceNode);
    else u.order = null;
  }
}

// ближайшее недостроенное здание игрока — куда крестьянину пойти достраивать дальше
export function nearestUnbuilt(u: Unit): Building | null {
  let best: Building | null = null, bd = 1e9;
  for (const b of G.buildings) {
    if (b.progress >= 1) continue;
    const d = dist(u.gx, u.gy, b.cx, b.cy);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
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

export function moveFormation(units: Unit[], wx: number, wy: number, queue = false) {
  const n = units.length, cols = Math.ceil(Math.sqrt(n)); let i = 0;
  units.forEach(u => {
    const ox = (i % cols) - (cols - 1) / 2, oy = ((i / cols) | 0) - (cols - 1) / 2; i++;
    moveOrder(u, clamp(wx + ox, 0, MAP.W - 1), clamp(wy + oy, 0, MAP.H - 1), queue);
  });
}

// ближайший враг рядом с точкой клика
export function enemyAt(wx: number, wy: number): Unit | null {
  let best: Unit | null = null, bd = 1.4;
  for (const u of G.units) if (u.side === 'enemy') { const d = dist(u.gx, u.gy, wx, wy); if (d < bd) { bd = d; best = u; } }
  return best;
}

// умный приказ выделению по клику правой кнопкой / тапу-команде.
// queue (Shift) — добавить приказ в хвост к уже отданным, не сбрасывая план.
export function commandSelection(wx: number, wy: number, queue = false) {
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
  if (foe) { players.forEach(u => attackOrder(u, foe, true, queue)); flash(foe.gx, foe.gy, '#ff5a4a'); return; }
  if (tile && tile.kind === 'node') {
    players.forEach(u => u.type === 'peasant' ? gatherOrder(u, tile, queue) : moveOrder(u, tile.gx, tile.gy, queue));
    flash(tile.gx, tile.gy, '#7ec85a');
  } else if (tile && tile.kind === 'building' && (tile as any).side === undefined && BUILDINGS[tile.key]) {
    if (tile.progress < 1) players.forEach(u => u.type === 'peasant' ? buildOrder(u, tile, queue) : moveOrder(u, tile.cx, tile.cy, queue));
    else if (tile.def.farm) players.forEach(u => u.type === 'peasant' ? farmOrder(u, tile, queue) : moveOrder(u, tile.cx, tile.cy, queue));
    else players.forEach(u => moveOrder(u, tile.cx, tile.cy, queue));
    flash(tile.cx, tile.cy, '#cfa14a');
  } else {
    moveFormation(players, wx, wy, queue);
    flash(wx, wy, '#6fb0ff');
  }
}

export { inBounds };
