// Сетка проходимости и привязка тайлов к объектам.
import { G } from './state';
import { inBounds } from './iso';
import { MAP } from '../data/config';
import type { Entity } from './types';

export function makeGrid() {
  G.solid = Array.from({ length: MAP.H }, () => new Uint8Array(MAP.W));
  G.tileObj = Array.from({ length: MAP.H }, () => new Array<Entity | null>(MAP.W).fill(null));
}

export function markTiles(obj: Entity, ox: number, oy: number, s: number, val: boolean) {
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    if (inBounds(x, y)) { G.solid[y][x] = val ? 1 : 0; G.tileObj[y][x] = val ? obj : null; }
  }
}

// объект в тайле по мировым координатам (для кликов/команд)
export function pickTile(wx: number, wy: number): Entity | null {
  const x = Math.round(wx), y = Math.round(wy);
  return inBounds(x, y) ? G.tileObj[y][x] : null;
}
