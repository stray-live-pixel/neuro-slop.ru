// Выделение: выбор по клику/тапу, рамкой, и снятие.
import { G, mouse } from '../core/state';
import { g2s } from '../core/iso';
import { centerOn } from '../sim/map';
import { renderPanel } from '../ui/panel';
import { sfx } from '../audio/sfx';
import type { Selectable, Unit, Building, ResourceNode, HitBox } from '../core/types';

type Rect = { x: number; y: number; w: number; h: number };

// Экранный прямоугольник всего PNG-ассета по кешированному из рендера боксу.
function screenBox(gx: number, gy: number, h: HitBox) {
  const base = g2s(gx, gy), z = G.cam.zoom, cx = base.x + h.cx * z;
  return { l: cx - h.hw * z, r: cx + h.hw * z, t: base.y + h.top * z, b: base.y + h.bot * z };
}
function boxHas(gx: number, gy: number, h: HitBox, sx: number, sy: number): boolean {
  const b = screenBox(gx, gy, h);
  return sx >= b.l && sx <= b.r && sy >= b.t && sy <= b.b;
}
function boxHits(gx: number, gy: number, h: HitBox, r: Rect): boolean {
  const b = screenBox(gx, gy, h);   // пересечение (хоть чуть-чуть) PNG-бокса с рамкой
  return b.l <= r.x + r.w && b.r >= r.x && b.t <= r.y + r.h && b.b >= r.y;
}

// Юнит под курсором: попадание по всему PNG; при наложении — нарисованный спереди.
export function pickUnit(sx: number, sy: number): Unit | null {
  let best: Unit | null = null, bz = -Infinity;
  for (const u of G.units) {
    if (!u.hit || !boxHas(u.gx, u.gy, u.hit, sx, sy)) continue;
    const z = u.gx + u.gy;
    if (z > bz) { bz = z; best = u; }
  }
  if (best) return best;
  // запас до первого рендера (бокс ещё не посчитан) — ближайший центр
  let bd = 26 * G.cam.zoom;
  for (const u of G.units) {
    const s = g2s(u.gx, u.gy);
    const d = Math.hypot(s.x - sx, s.y - sy - 14);
    if (d < bd) { bd = d; best = u; }
  }
  return best;
}

// Здание/ресурс под курсором — по всему PNG (включая высокую часть над тайлом).
export function pickObj(sx: number, sy: number): Building | ResourceNode | null {
  let best: Building | ResourceNode | null = null, bz = -Infinity;
  for (const b of G.buildings) {
    if (!b.hit || !boxHas(b.cx, b.cy, b.hit, sx, sy)) continue;
    const z = b.ox + b.oy + b.size;
    if (z > bz) { bz = z; best = b; }
  }
  for (const n of G.nodes) {
    if (!n.hit || !boxHas(n.gx, n.gy, n.hit, sx, sy)) continue;
    const z = n.gx + n.gy + 0.2;
    if (z > bz) { bz = z; best = n; }
  }
  return best;
}

// Единая геометрия попадания юнита в рамку — пересечение всего PNG (любое касание).
function inRect(u: Unit, r: Rect): boolean {
  if (u.hit) return boxHits(u.gx, u.gy, u.hit, r);
  const s = g2s(u.gx, u.gy);   // запас до первого рендера
  return s.x >= r.x && s.x <= r.x + r.w && s.y - 14 >= r.y && s.y - 14 <= r.y + r.h;
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
// крестьяне без приказа и без очереди приказов — «без работы»
export function idlePeasants(): Unit[] {
  return G.units.filter((u): u is Unit =>
    u.side === 'player' && u.type === 'peasant' && !u.order && u.queue.length === 0);
}

// выбрать следующего бездействующего крестьянина (циклом) и навести на него камеру
export function selectIdlePeasant() {
  const idle = idlePeasants();
  if (!idle.length) {
    const any = G.units.find(u => u.side === 'player' && u.type === 'peasant') as Unit | undefined;
    if (any) { selectOne(any); centerOn(any.gx, any.gy); }
    return;
  }
  const cur = G.selection.length === 1 ? idle.indexOf(G.selection[0] as Unit) : -1;
  const u = idle[(cur + 1) % idle.length];
  selectOne(u); centerOn(u.gx, u.gy);
}
