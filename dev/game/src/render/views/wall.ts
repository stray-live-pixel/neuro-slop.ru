// Вид частокола: адаптивная сборка из отдельных кольев по соседям (как стены в AoE2).
// Один тайл без соседей-стен → замкнутый квадратный частокол в клетке.
// Есть соседи → колья тянутся к общим граням и стыкуются со встречной половиной
// соседнего тайла → непрерывная стена. Углы/тройники/перекрёстки выходят сами.
import { Container, Graphics, Sprite } from 'pixi.js';
import { G } from '../../core/state';
import { iso, inBounds } from '../../core/iso';
import { TILE } from '../../data/config';
import { R } from '../context';
import { drawBarG, drawDiamondSel, drawFootprintShade } from '../draw';
import type { Building } from '../../core/types';

export interface WallView extends Container {
  sh: Graphics; posts: Container; bar: Graphics; sel: Graphics;
  imgKey: string; mask: number; stoneTint: number; spriteH: number;
  popped: boolean; _pop: number;
}

// Половина шага до середины соответствующей грани ромба (локальные мировые px).
// +gx — вниз-вправо, +gy — вниз-влево, −gx — вверх-влево, −gy — вверх-вправо.
const DIRS = [
  { dx: 1, dy: 0, vx: TILE.w / 4, vy: TILE.h / 4 },
  { dx: 0, dy: 1, vx: -TILE.w / 4, vy: TILE.h / 4 },
  { dx: -1, dy: 0, vx: -TILE.w / 4, vy: -TILE.h / 4 },
  { dx: 0, dy: -1, vx: TILE.w / 4, vy: -TILE.h / 4 },
];
// Углы ромба тайла (локально) — каркас замкнутого частокола для одиночного блока.
const CORNERS = [
  { vx: 0, vy: -TILE.h / 2 }, { vx: TILE.w / 2, vy: 0 },
  { vx: 0, vy: TILE.h / 2 }, { vx: -TILE.w / 2, vy: 0 },
];

const STAKE_H = TILE.h * 1.46;       // высота кола ≈ полтора тайла — стена выше земли
const PICKET_T = [0.32, 0.62, 0.92]; // доли половины-пролёта, где стоят колья

function isWall(x: number, y: number): boolean {
  if (!inBounds(x, y)) return false;
  const o = G.tileObj[y]?.[x];
  return !!o && o.kind === 'building' && (o as Building).key === 'wall';
}

function neighborMask(b: Building): number {
  let m = 0;
  for (let i = 0; i < 4; i++) if (isWall(b.cx + DIRS[i].dx, b.cy + DIRS[i].dy)) m |= 1 << i;
  return m;
}

// Один кол: спрайт, заякоренный за нижний край, в точке (px,py) локально.
function addStake(c: WallView, px: number, py: number, hMul: number): void {
  const tex = R.tex[c.imgKey];
  const sp = new Sprite(tex); sp.anchor.set(0.5, 1);
  const sc = (STAKE_H * hMul) / (tex.height || STAKE_H);
  sp.scale.set(sc); sp.position.set(px, py);
  sp.tint = c.stoneTint; sp.zIndex = py;       // ближний (ниже) — поверх дальнего
  c.posts.addChild(sp);
}

// Пересобрать колья под текущую маску соседей.
function rebuild(c: WallView, b: Building): void {
  c.posts.removeChildren().forEach(s => s.destroy());
  c.posts.sortableChildren = true;
  const m = c.mask;

  if (m === 0) {                                 // одиночный блок — замкнутый квадратный частокол
    for (let e = 0; e < 4; e++) {                // частые колья вдоль всех четырёх граней ромба
      const a = CORNERS[e], b = CORNERS[(e + 1) % 4];
      for (const t of [0, 0.34, 0.67]) addStake(c, a.vx + (b.vx - a.vx) * t, a.vy + (b.vy - a.vy) * t, 0.92);
    }
    c.spriteH = STAKE_H;
    return;
  }

  // Пролёты к каждому соседу-стене: половина до общей грани, встречную ставит сосед.
  for (let i = 0; i < 4; i++) if (m & (1 << i)) {
    const d = DIRS[i];
    for (const t of PICKET_T) addStake(c, d.vx * t, d.vy * t, 1.0);
  }
  // Узловой столб по центру. На прямом проходе (два противоположных соседа) —
  // обычный кол, чтобы стена шла ровно; на углах/концах/тройниках — мощнее.
  const straight = m === 0b0101 || m === 0b1010;
  addStake(c, 0, 0, straight ? 1.0 : 1.18);
  c.spriteH = STAKE_H * (straight ? 1.0 : 1.18);
}

export function makeWallView(b: Building): WallView {
  const c = new Container() as WallView;
  c.imgKey = b.def.img;
  c.sh = c.addChild(new Graphics());
  c.posts = c.addChild(new Container());
  c.bar = c.addChild(new Graphics());
  c.sel = c.addChild(new Graphics());
  c.mask = -1; c.stoneTint = 0xffffff; c.spriteH = STAKE_H;
  c.popped = false; c._pop = 0;
  drawFootprintShade(c.sh, b);
  return c;
}

export function updateWallView(c: WallView, b: Building, dt: number) {
  const p = iso(b.cx, b.cy); c.position.set(p.x, p.y);
  c.zIndex = (b.ox + b.size - 1) + (b.oy + b.size - 1);

  const stone = (b.key === 'wall' && G.up.stonewall) ? 0xC2C7CC : 0xffffff;
  const m = neighborMask(b);
  if (m !== c.mask || stone !== c.stoneTint) { c.mask = m; c.stoneTint = stone; rebuild(c, b); }

  // достройка — общая прозрачность; «поп» при завершении — лёгкое подрастание
  c.posts.alpha = b.progress < 1 ? 0.4 + b.progress * 0.5 : 1;
  if (b.progress >= 1 && !c.popped) { c.popped = true; c._pop = 1; }
  if (c._pop > 0) { c._pop = Math.max(0, c._pop - dt * 3); c.posts.scale.set(1, 1 + 0.12 * c._pop); }
  else c.posts.scale.set(1);

  c.bar.clear();
  if (b.progress < 1) drawBarG(c.bar, 0, -c.spriteH * 0.6, TILE.w * 0.6, b.progress, 0xe7c14b);
  else if (b.hp < b.maxhp) drawBarG(c.bar, 0, -c.spriteH - 8, TILE.w * 0.5, b.hp / b.maxhp, 0x6fcf6f);

  const sel = G.selection.includes(b);
  c.sel.clear(); if (sel) drawDiamondSel(c.sel, b);
  // наведение — лёгкое подсвечивание кольев (контур по силуэту тут не нужен)
  const hov = G.hover === b && !sel;
  for (const s of c.posts.children) (s as Sprite).tint = hov ? 0xffe9c0 : stone;

  // клик по всему тайлу с запасом на высоту стены
  b.hit = { cx: 0, hw: TILE.w * 0.5, top: -c.spriteH, bot: TILE.h * 0.5 };
}
