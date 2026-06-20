// Что показывать для выделенных юнитов с приказом «идти»: флажок точки назначения
// и оставшийся путь до неё. Чистые данные в грид-координатах — без iso/DOM/Pixi,
// поэтому логику легко протестировать (рендер живёт в fx.ts).
import type { Building, Order, PathPt, ResourceNode, Selectable, Unit } from '../core/types';

export interface MoveMarker {
  unit: Unit;
  dest: PathPt;      // куда идёт юнит — последняя точка пути (там ставим флажок)
  route: PathPt[];   // ломаная для отрисовки: текущая позиция юнита + оставшиеся точки пути
}

// Маркеры для всех выделенных юнитов игрока, которым отдан приказ move и которые ещё в пути.
// Только move: у gather/build/attack цель — сама сущность (узел/здание/враг), она и так подсвечена.
export function moveOrderMarkers(selection: Selectable[]): MoveMarker[] {
  const out: MoveMarker[] = [];
  for (const s of selection) {
    if (s.kind !== 'unit' || s.side !== 'player') continue;
    if (s.order?.type !== 'move') continue;
    const path = s.path;
    if (!path || s.wp >= path.length) continue;          // нет пути или уже дошёл
    const rest = path.slice(s.wp);                       // оставшиеся точки (пройденные не рисуем)
    out.push({ unit: s, dest: rest[rest.length - 1], route: [{ x: s.gx, y: s.gy }, ...rest] });
  }
  return out;
}

/* ---------------------- цепочка приказов (очередь Shift) ------------------- */
export interface OrderChain {
  unit: Unit;
  points: PathPt[];   // ломаная для отрисовки: позиция юнита → текущий приказ → очередь
  flags: PathPt[];    // куда ставим флажки — конечная точка каждого приказа в цепочке
}

// Точка назначения приказа в грид-координатах (для move — координаты, иначе центр цели).
function orderDest(o: Order): PathPt | null {
  if (o.type === 'move') return (o.gx != null && o.gy != null) ? { x: o.gx, y: o.gy } : null;
  const t = o.target as Building | ResourceNode | undefined;
  if (!t) return null;
  return t.kind === 'building' ? { x: t.cx, y: t.cy } : { x: t.gx, y: t.gy };
}

// Маркеры всей цепочки приказов выделенных юнитов игрока. Рисуем, когда есть очередь
// (Shift) или приказ move; одиночные gather/build/attack и так подсвечены контуром цели.
export function orderChainMarkers(selection: Selectable[]): OrderChain[] {
  const out: OrderChain[] = [];
  for (const s of selection) {
    if (s.kind !== 'unit' || s.side !== 'player') continue;
    const u = s as Unit;
    const queue = u.queue ?? [];
    const o = u.order;
    if (!o && !queue.length) continue;
    if (!queue.length && (!o || o.type !== 'move')) continue;
    const points: PathPt[] = [{ x: u.gx, y: u.gy }];
    const flags: PathPt[] = [];
    if (o) {
      let dest: PathPt | null;
      if (o.type === 'move' && u.path && u.wp < u.path.length) {
        const rest = u.path.slice(u.wp); points.push(...rest); dest = rest[rest.length - 1];
      } else { dest = orderDest(o); if (dest) points.push(dest); }
      if (dest) flags.push(dest);
    }
    for (const q of queue) { const d = orderDest(q); if (d) { points.push(d); flags.push(d); } }
    if (flags.length) out.push({ unit: u, points, flags });
  }
  return out;
}
