// Локальное расталкивание юнитов (boids separation): мягко отодвигаем соседей,
// чтобы они не слипались в одну точку. «Коллайдер» юнита — доля его клетки-следа
// (1 тайл): добытчики и бойцы остаются в пределах досягаемости цели и не стоят
// «стопкой», но и не распихиваются далеко. Раньше радиус был 0.66 тайла — слишком
// крупный (юниты не пролезали между домами); теперь 30% размера юнита.
//
// Расталкиваются только СТОЯЧИЕ юниты (работающие крестьяне, бойцы в упор, простой):
// они держат строй по коллайдеру. Идущие юниты в расталкивании не участвуют — могут
// «залезать» друг на друга и проходить насквозь, чтобы не мешать движению колонной.
// Пространственный хеш по тайлам — проверяем только 9 соседних клеток (дёшево).
import { G } from '../core/state';
import { inBounds, clamp } from '../core/iso';
import { MAP } from '../data/config';
import type { Unit } from '../core/types';

const UNIT_SIZE = 1;                 // след юнита — одна клетка
export const COLLIDER = 0.30;        // коллайдер = 30% размера юнита
const SEP_R = UNIT_SIZE * COLLIDER, SEP_R2 = SEP_R * SEP_R;

// «в движении» = ещё идёт по маршруту (путь есть и не пройден до конца). Дойдя до цели,
// юнит обнуляет путь (добыча/стройка/бой) либо ставит wp за конец (приказ «идти»).
export function isMoving(u: Unit): boolean {
  return !!u.path && u.wp < u.path.length;
}

function solidAt(x: number, y: number): boolean {
  const xi = x | 0, yi = y | 0;
  return !inBounds(xi, yi) || !!G.solid[yi][xi];
}

export function separateUnits(dt: number) {
  const units = G.units;
  if (units.length < 2) return;

  // в хеш кладём только стоячих — идущие юниты ни на кого не давят и сами не расталкиваются
  const cell = new Map<number, Unit[]>();
  const ck = (x: number, y: number) => (((y | 0) + 80) << 9) | (((x | 0) + 80) & 0x1ff);
  for (const u of units) {
    if (isMoving(u)) continue;
    const k = ck(u.gx, u.gy);
    let arr = cell.get(k); if (!arr) { arr = []; cell.set(k, arr); }
    arr.push(u);
  }

  const push = Math.min(0.85, 7 * dt);
  for (const u of units) {
    if (isMoving(u)) continue;          // идущих не трогаем — пусть проходят сквозь
    let px = 0, py = 0, n = 0;
    const bx = u.gx | 0, by = u.gy | 0;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const arr = cell.get(ck(bx + ox, by + oy)); if (!arr) continue;
      for (const v of arr) {
        if (v === u) continue;
        const dx = u.gx - v.gx, dy = u.gy - v.gy, d2 = dx * dx + dy * dy;
        if (d2 > SEP_R2) continue;
        if (d2 > 1e-5) { const d = Math.sqrt(d2), f = (SEP_R - d) / SEP_R; px += dx / d * f; py += dy / d * f; }
        else { const a = u.id * 2.3998; px += Math.cos(a) * 0.6; py += Math.sin(a) * 0.6; }  // ровно совпали
        n++;
      }
    }
    if (!n) continue;
    const nx = clamp(u.gx + px * push, 0, MAP.W - 1.001), ny = clamp(u.gy + py * push, 0, MAP.H - 1.001);
    if (!solidAt(nx, u.gy)) u.gx = nx;
    if (!solidAt(u.gx, ny)) u.gy = ny;
  }
}
