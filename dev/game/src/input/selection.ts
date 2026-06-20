// Выделение: выбор по клику/тапу, рамкой, и снятие.
import { G, mouse } from '../core/state';
import { g2s } from '../core/iso';
import { renderPanel } from '../ui/panel';
import { sfx } from '../audio/sfx';
import type { Selectable, Unit } from '../core/types';

export function pickUnit(sx: number, sy: number): Unit | null {
  let best: Unit | null = null, bd = 26 * G.cam.zoom;
  for (const u of G.units) {
    const s = g2s(u.gx, u.gy);
    const d = Math.hypot(s.x - sx, s.y - sy - 14);
    if (d < bd) { bd = d; best = u; }
  }
  return best;
}

// Единая геометрия попадания юнита в экранную рамку (тело смещено на 14px вверх).
type Rect = { x: number; y: number; w: number; h: number };
function inRect(u: Unit, r: Rect): boolean {
  const s = g2s(u.gx, u.gy);
  return s.x >= r.x && s.x <= r.x + r.w && s.y - 14 >= r.y && s.y <= r.y + r.h;
}

// Живое превью рамки: попадёт ли юнит игрока в текущую тянущуюся рамку (до отпускания).
export function inDragRect(u: Unit): boolean {
  return mouse.down && !!mouse.dragRect && u.side === 'player' && inRect(u, mouse.dragRect);
}

export function deselect() { G.selection = []; renderPanel(); }

export function selectOne(o: Selectable | null) {
  G.selection = o ? [o] : [];
  renderPanel();
  if (o) sfx('select');
}

export function boxSelect(r: { x: number; y: number; w: number; h: number }, add: boolean) {
  const sel: Selectable[] = add ? G.selection.slice() : [];
  for (const u of G.units) if (u.side === 'player' && inRect(u, r) && !sel.includes(u)) sel.push(u);
  // если в рамке есть юниты — берём только юнитов
  G.selection = sel.length ? sel.filter(o => o.kind === 'unit') : sel;
  renderPanel();
}

// выбрать всё войско / всех простаивающих крестьян (мобильные кнопки и хоткеи)
export function selectAllArmy() {
  const army = G.units.filter(u => u.side === 'player' && u.type !== 'peasant');
  if (army.length) { G.selection = army; renderPanel(); sfx('select'); }
}
export function selectIdlePeasant() {
  const idle = G.units.find(u => u.side === 'player' && u.type === 'peasant' && !u.order);
  const any = idle || G.units.find(u => u.side === 'player' && u.type === 'peasant');
  if (any) { selectOne(any); }
}
