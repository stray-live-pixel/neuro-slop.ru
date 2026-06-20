// Что показывать для выделенных юнитов с приказом «идти»: флажок точки назначения
// и оставшийся путь до неё. Чистые данные в грид-координатах — без iso/DOM/Pixi,
// поэтому логику легко протестировать (рендер живёт в fx.ts).
import type { PathPt, Selectable, Unit } from '../core/types';

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
