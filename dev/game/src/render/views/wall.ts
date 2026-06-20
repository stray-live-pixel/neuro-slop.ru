// Вид частокола: процедурная стена из отдельных кольев (ассет wall-post) по соседям.
// Автотайлинг как в AoE2, но в 8 направлениях: 4 по граням ромба (прямые соседи) и
// 4 по его углам (диагональные соседи) — поэтому стена непрерывна и по диагонали.
// Колья ставятся от центра тайла до общей с соседом точки (середина грани или угол);
// встречную половину ставит сосед → шов всегда сходится. Одиночный блок → замкнутый
// частокол по контуру ромба.
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

// 8 направлений к соседям. Для каждого: смещение в сетке (dx,dy) и общая с соседом
// точка в локальных мировых px (mx,my) = половина пути до центра соседа.
// Прямые соседи (биты 0–3) сходятся на середине грани ромба, диагональные (4–7) — в углу.
const DIRS = [
  { dx: 1, dy: 0, mx: TILE.w / 4, my: TILE.h / 4 },   // 0 грань ЮВ
  { dx: 0, dy: 1, mx: -TILE.w / 4, my: TILE.h / 4 },  // 1 грань ЮЗ
  { dx: -1, dy: 0, mx: -TILE.w / 4, my: -TILE.h / 4 },// 2 грань СЗ
  { dx: 0, dy: -1, mx: TILE.w / 4, my: -TILE.h / 4 }, // 3 грань СВ
  { dx: 1, dy: 1, mx: 0, my: TILE.h / 2 },            // 4 угол Ю
  { dx: 1, dy: -1, mx: TILE.w / 2, my: 0 },           // 5 угол В
  { dx: -1, dy: 1, mx: -TILE.w / 2, my: 0 },          // 6 угол З
  { dx: -1, dy: -1, mx: 0, my: -TILE.h / 2 },         // 7 угол С
];

const STAKE_H = TILE.h * 1.5;   // высота кола ≈ полтора тайла — стена выше земли
const POST_GAP = 12;            // шаг кольев вдоль пролёта (px) — для плотной сплошной стены

function isWall(x: number, y: number): boolean {
  if (!inBounds(x, y)) return false;
  const o = G.tileObj[y]?.[x];
  return !!o && o.kind === 'building' && (o as Building).key === 'wall';
}

// Маска соседей-стен. Диагональ учитываем только если оба смежных прямых тайла пусты —
// иначе на L-углах и в заполненных блоках появлялись бы лишние диагональные перемычки.
function neighborMask(b: Building): number {
  let m = 0;
  for (let i = 0; i < 4; i++) if (isWall(b.cx + DIRS[i].dx, b.cy + DIRS[i].dy)) m |= 1 << i;
  for (let i = 4; i < 8; i++) {
    const d = DIRS[i];
    if (isWall(b.cx + d.dx, b.cy + d.dy) && !isWall(b.cx + d.dx, b.cy) && !isWall(b.cx, b.cy + d.dy)) m |= 1 << i;
  }
  return m;
}

// Один кол: спрайт, заякоренный за нижний край, в точке (px,py) локально.
function addStake(c: WallView, px: number, py: number, hMul = 1): void {
  const tex = R.tex[c.imgKey];
  const sp = new Sprite(tex); sp.anchor.set(0.5, 1);
  const sc = (STAKE_H * hMul) / (tex.height || STAKE_H);
  sp.scale.set(sc); sp.position.set(px, py);
  sp.tint = c.stoneTint; sp.zIndex = py;       // ближний (ниже) — поверх дальнего
  c.posts.addChild(sp);
}

// Ряд кольев от центра (0,0) до общей точки (mx,my) с шагом ≈POST_GAP — плотный пролёт.
function addSpan(c: WallView, mx: number, my: number): void {
  const n = Math.max(1, Math.round(Math.hypot(mx, my) / POST_GAP));
  for (let i = 1; i <= n; i++) addStake(c, (mx * i) / n, (my * i) / n);
}

// Пересобрать колья под текущую маску соседей.
function rebuild(c: WallView): void {
  c.posts.removeChildren().forEach(s => s.destroy());
  c.posts.sortableChildren = true;
  const m = c.mask;

  if (m === 0) {                               // одиночный блок — замкнутый частокол по контуру ромба
    for (const d of DIRS) addStake(c, d.mx, d.my);   // 8 кольев: углы + середины граней
    addStake(c, 0, 0, 1.06);                         // столб в центре
    c.spriteH = STAKE_H * 1.06;
    return;
  }

  for (let i = 0; i < 8; i++) if (m & (1 << i)) addSpan(c, DIRS[i].mx, DIRS[i].my);
  // Центральный столб. На прямом проходе (два противоположных прямых соседа) — обычный,
  // чтобы стена шла ровно; на углах/концах/тройниках/перекрёстках — мощнее.
  const cardinals = m & 0b1111;
  const straight = cardinals === 0b0101 || cardinals === 0b1010;
  const ch = straight ? 1 : 1.14;
  addStake(c, 0, 0, ch);
  c.spriteH = STAKE_H * Math.max(ch, 1);
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
  if (m !== c.mask || stone !== c.stoneTint) { c.mask = m; c.stoneTint = stone; rebuild(c); }

  // Достройка: ровная «призрачная» полупрозрачность — одинаковая у всех недостроенных,
  // поэтому ряд не выглядит пятнистым и «разноцветным». Готовый частокол — плотный.
  const building = b.progress < 1;
  c.posts.alpha = building ? 0.6 : 1;
  if (!building && !c.popped) { c.popped = true; c._pop = 1; }            // «поп» при завершении
  if (c._pop > 0) { c._pop = Math.max(0, c._pop - dt * 3); c.posts.scale.set(1, 1 + 0.12 * c._pop); }
  else c.posts.scale.set(1);

  c.bar.clear();
  if (building) drawBarG(c.bar, 0, -c.spriteH * 0.6, TILE.w * 0.6, b.progress, 0xe7c14b);
  else if (b.hp < b.maxhp) drawBarG(c.bar, 0, -c.spriteH - 8, TILE.w * 0.5, b.hp / b.maxhp, 0x6fcf6f);

  const sel = G.selection.includes(b);
  c.sel.clear(); if (sel) drawDiamondSel(c.sel, b);
  // наведение — лёгкое подсвечивание кольев (контур по силуэту тут не нужен)
  const hov = G.hover === b && !sel;
  for (const s of c.posts.children) (s as Sprite).tint = hov ? 0xffe9c0 : stone;

  // клик по всему тайлу с запасом на высоту стены
  b.hit = { cx: 0, hw: TILE.w * 0.5, top: -c.spriteH, bot: TILE.h * 0.5 };
}
