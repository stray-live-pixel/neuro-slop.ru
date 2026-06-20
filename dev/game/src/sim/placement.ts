// Режим строительства: размещение призрака здания и постановка на землю.
import { G, keys } from '../core/state';
import { inBounds } from '../core/iso';
import { BUILDINGS } from '../data/buildings';
import { canAfford, pay } from './economy';
import { placeBuilding } from './entities';
import { buildOrder } from './commands';
import { sfx } from '../audio/sfx';
import { toast } from '../ui/toast';
import { updateHUD } from '../ui/hud';
import type { Unit } from '../core/types';

export function startPlacement(key: string) { G.place = { key }; }

export function canPlace(ox: number, oy: number, s: number): boolean {
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    if (!inBounds(x, y) || G.solid[y][x]) return false;
  }
  return true;
}

export function tryPlace() {
  if (!G.place) return;
  const d = BUILDINGS[G.place.key]; const ox = G.place.ox!, oy = G.place.oy!; const s = d.size;
  if (!canPlace(ox, oy, s)) { toast('Здесь нельзя строить'); sfx('error'); return; }
  if (!canAfford(d.cost)) { toast('Не хватает ресурсов'); sfx('error'); return; }
  pay(d.cost); sfx('build');
  const b = placeBuilding(G.place.key, ox, oy, false);
  const builders = G.selection.filter((u): u is Unit => u.kind === 'unit' && u.type === 'peasant');
  builders.forEach(u => buildOrder(u, b));
  if (!keys['shift']) G.place = null;
  updateHUD();
}
