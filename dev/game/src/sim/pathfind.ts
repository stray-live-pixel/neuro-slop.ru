// A*-поиск пути по сетке. Стены/здания/узлы — преграды.
import { G } from '../core/state';
import { inBounds } from '../core/iso';
import { isWaterTile } from '../core/grid';
import { MAP } from '../data/config';
import type { Building, PathPt, ResourceNode, Unit } from '../core/types';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
export { DIRS };

// cornerCut: разрешить диагональ между двумя занятыми углами (юниты игрока пролезают
// в щели между зданиями). По умолчанию выключено — враги не срезают углы у стен/домов.
export function findPath(sx: number, sy: number, tx: number, ty: number, allowGoalSolid: boolean, cornerCut = false): PathPt[] | null {
  // координаты приходят дробными (позиция юнита, точка клика) — берём БЛИЖАЙШИЙ тайл, как
  // ghost-превью и pickTile (Math.round). Раньше тут было |0 (обрезание вниз): при клике в
  // верхнюю половину ромба цель уезжала на клетку вверх-влево — флажок вставал не туда.
  sx = Math.round(sx); sy = Math.round(sy); tx = Math.round(tx); ty = Math.round(ty);
  if (!inBounds(tx, ty)) return null;
  if (sx === tx && sy === ty) return [{ x: tx, y: ty }];
  const key = (x: number, y: number) => y * MAP.W + x;
  const open = [{ x: sx, y: sy, g: 0, f: 0 }];
  const came = new Map<number, number>(), gsc = new Map<number, number>();
  gsc.set(key(sx, sy), 0);
  // октиль-эвристика (допускает диагонали) — пути ровнее, без «лесенки»
  const h = (x: number, y: number) => { const dx = Math.abs(x - tx), dy = Math.abs(y - ty); return (dx + dy) - 0.586 * Math.min(dx, dy); };
  let guard = 0;
  const guardLimit = MAP.W * MAP.H * 6;
  while (open.length && guard++ < guardLimit) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur.x === tx && cur.y === ty) {
      const path: PathPt[] = []; let k = key(cur.x, cur.y), cx = cur.x, cy = cur.y;
      while (k !== key(sx, sy)) { path.push({ x: cx, y: cy }); const p = came.get(k)!; cx = p % MAP.W; cy = (p - cx) / MAP.W; k = p; }
      path.reverse(); return path;
    }
    for (const [dx, dy] of DIRS) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!inBounds(nx, ny)) continue;
      const goal = nx === tx && ny === ty;
      if (isWaterTile(nx, ny)) continue;
      if (G.solid[ny][nx] && !(goal && allowGoalSolid)) continue;
      if (dx && dy) {
        // Воду нельзя «срезать» по диагонали даже юнитам игрока: через реку ведут только мосты.
        if (isWaterTile(nx, cur.y) || isWaterTile(cur.x, ny)) continue;
        if (!cornerCut && (G.solid[cur.y][nx] || G.solid[ny][cur.x])) continue; // без срезания углов
      }
      const ng = cur.g + (dx && dy ? 1.41 : 1);
      const nk = key(nx, ny);
      if (ng < (gsc.get(nk) ?? 1e9)) {
        came.set(nk, key(cur.x, cur.y)); gsc.set(nk, ng);
        open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) });
      }
    }
  }
  return null;
}

// ближайший свободный тайл рядом с целью (зданием/узлом), достижимый из (sx,sy)
export function pathToNear(sx: number, sy: number, target: Building | ResourceNode | Unit, cornerCut = false): PathPt[] | null {
  const ring: [number, number][] = [];
  if (target.kind === 'building') {
    const s = target.size;
    for (let x = target.ox - 1; x <= target.ox + s; x++) { ring.push([x, target.oy - 1], [x, target.oy + s]); }
    for (let y = target.oy; y < target.oy + s; y++) { ring.push([target.ox - 1, y], [target.ox + s, y]); }
  } else {
    const tx = Math.round(target.gx), ty = Math.round(target.gy);
    ring.push([tx, ty]);                                  // сам тайл цели (юнит не блокирует)
    for (const [dx, dy] of DIRS) ring.push([tx + dx, ty + dy]);
  }
  ring.sort((a, b) => (Math.abs(a[0] - sx) + Math.abs(a[1] - sy)) - (Math.abs(b[0] - sx) + Math.abs(b[1] - sy)));
  for (const [x, y] of ring) {
    if (!inBounds(x, y) || !isWalkableCandidate(x, y)) continue;
    const p = findPath(sx, sy, x, y, false, cornerCut);
    if (p) return p;
  }
  return null;
}

// если целевой тайл занят — встать рядом
export function pathToNearTile(sx: number, sy: number, tx: number, ty: number, cornerCut = false): PathPt[] | null {
  const cands: [number, number][] = [[tx, ty], ...DIRS.map(([dx, dy]) => [tx + dx, ty + dy] as [number, number])];
  cands.sort((a, b) => (Math.abs(a[0] - tx) + Math.abs(a[1] - ty)) - (Math.abs(b[0] - tx) + Math.abs(b[1] - ty)));
  for (const [x, y] of cands) {
    if (inBounds(x, y) && isWalkableCandidate(x, y)) { const p = findPath(sx, sy, x, y, false, cornerCut); if (p) return p; }
  }
  return null;
}

function isWalkableCandidate(x: number, y: number): boolean {
  return !isWaterTile(x, y) && !G.solid[y][x];
}
