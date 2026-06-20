// Изометрическая математика и мелкие утилиты.
import { G } from './state';
import { MAP, TILE } from '../data/config';

export const HW = () => TILE.w / 2 * G.cam.zoom;
export const HH = () => TILE.h / 2 * G.cam.zoom;

// мировые координаты (внутри контейнера world)
export function iso(gx: number, gy: number) {
  return { x: (gx - gy) * TILE.w / 2, y: (gx + gy) * TILE.h / 2 };
}
// экранные координаты (учитывают камеру)
export function g2s(gx: number, gy: number) {
  return { x: (gx - gy) * HW() + G.cam.x, y: (gx + gy) * HH() + G.cam.y };
}
export function s2g(sx: number, sy: number) {
  const a = (sx - G.cam.x) / HW(), b = (sy - G.cam.y) / HH();
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

export const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP.W && y < MAP.H;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
export const colHex = (s: string) => parseInt(s.slice(1), 16);
