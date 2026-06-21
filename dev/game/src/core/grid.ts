// Сетка проходимости и привязка тайлов к объектам.
import { G } from './state';
import { inBounds } from './iso';
import { MAP } from '../data/config';
import type { Entity } from './types';

export const TERRAIN = { LAND: 0, WATER: 1, BRIDGE: 2 } as const;

export function makeGrid() {
  G.solid = Array.from({ length: MAP.H }, () => new Uint8Array(MAP.W));
  G.tileObj = Array.from({ length: MAP.H }, () => new Array<Entity | null>(MAP.W).fill(null));
  G.terrain = Array.from({ length: MAP.H }, () => new Uint8Array(MAP.W));
}

export function markTiles(obj: Entity, ox: number, oy: number, s: number, val: boolean) {
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    if (inBounds(x, y)) { G.solid[y][x] = val ? 1 : 0; G.tileObj[y][x] = val ? obj : null; }
  }
}

export function terrainAt(x: number, y: number): number {
  return inBounds(x, y) ? (G.terrain[y]?.[x] ?? TERRAIN.LAND) : TERRAIN.WATER;
}

export function isWaterTile(x: number, y: number): boolean {
  return terrainAt(x, y) === TERRAIN.WATER;
}

export function isBridgeTile(x: number, y: number): boolean {
  return terrainAt(x, y) === TERRAIN.BRIDGE;
}

export function isWalkableTile(x: number, y: number, allowSolid = false): boolean {
  return inBounds(x, y) && !isWaterTile(x, y) && (allowSolid || !G.solid[y][x]);
}

export function isBuildableTile(x: number, y: number): boolean {
  return inBounds(x, y) && terrainAt(x, y) === TERRAIN.LAND && !G.solid[y][x];
}

// объект в тайле по мировым координатам (для кликов/команд).
// G.tileObj?.[y] — сетка может быть ещё не построена (наведение мыши на стартовом экране).
export function pickTile(wx: number, wy: number): Entity | null {
  const x = Math.round(wx), y = Math.round(wy);
  return inBounds(x, y) && G.tileObj[y] ? G.tileObj[y][x] : null;
}
