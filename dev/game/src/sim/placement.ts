// Режим строительства: размещение призрака здания и постановка на землю.
import { G, keys } from '../core/state';
import { isBuildableTile } from '../core/grid';
import { BUILDINGS } from '../data/buildings';
import { canAfford, pay } from './economy';
import { placeBuilding } from './entities';
import { buildOrder } from './commands';
import { sfx } from '../audio/sfx';
import { toast } from '../ui/toast';
import { updateHUD } from '../ui/hud';
import type { Building, Unit } from '../core/types';

export function startPlacement(key: string) { G.place = { key }; }

export function canPlace(ox: number, oy: number, s: number): boolean {
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    if (!isBuildableTile(x, y)) return false;
  }
  return true;
}

function selectedBuilders(): Unit[] {
  return G.selection.filter((u): u is Unit => u.kind === 'unit' && u.type === 'peasant');
}

export function tryPlace() {
  if (!G.place) return;
  const d = BUILDINGS[G.place.key]; const ox = G.place.ox!, oy = G.place.oy!; const s = d.size;
  if (!canPlace(ox, oy, s)) { toast('Здесь нельзя строить'); sfx('error'); return; }
  if (!canAfford(d.cost)) { toast('Не хватает ресурсов'); sfx('error'); return; }
  pay(d.cost); sfx('build');
  const b = placeBuilding(G.place.key, ox, oy, false);
  // Shift — добавить стройку в очередь крестьянам (и не выходить из режима, чтобы ставить ещё)
  const append = keys['shift'];
  selectedBuilders().forEach(u => buildOrder(u, b, append));
  if (!append) G.place = null;
  updateHUD();
}

// Тайлы линии частокола между двумя точками сетки (8-связный растр по большей оси).
export function wallLineCells(ax: number, ay: number, bx: number, by: number): { x: number; y: number }[] {
  const dx = bx - ax, dy = by - ay;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    cells.push({ x: Math.round(ax + dx * t), y: Math.round(ay + dy * t) });
  }
  return cells;
}

// Поставить частокол линией: ставим каждый свободный тайл, оплачивая поштучно, и
// последовательно ставим стройку крестьянам в очередь — они пройдут линию по порядку.
export function placeWallLine(cells: { x: number; y: number }[], append: boolean) {
  const d = BUILDINGS['wall'];
  const builders = selectedBuilders();
  const placed: Building[] = [];
  let blocked = false;
  for (const c of cells) {
    if (!canPlace(c.x, c.y, 1)) { blocked = true; continue; }
    if (!canAfford(d.cost)) { toast('Не хватает ресурсов'); sfx('error'); break; }
    pay(d.cost);
    placed.push(placeBuilding('wall', c.x, c.y, false));
  }
  if (!placed.length) { if (blocked) { toast('Здесь нельзя строить'); sfx('error'); } updateHUD(); return; }
  sfx('build');
  // первый сегмент уважает append (Shift), остальные всегда дописываются в очередь
  builders.forEach(u => placed.forEach((b, i) => buildOrder(u, b, i > 0 ? true : append)));
  updateHUD();
}
