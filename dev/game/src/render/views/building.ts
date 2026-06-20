// Вид здания: спрайт, прогресс/HP-бары, выделение, дым из труб, «поп» при достройке.
import { Container, Graphics, Sprite } from 'pixi.js';
import { G } from '../../core/state';
import { iso } from '../../core/iso';
import { TILE } from '../../data/config';
import { BUILDINGS } from '../../data/buildings';
import { spawnSmoke } from '../../sim/effects';
import { R } from '../context';
import { drawBarG, drawDiamondSel, drawFootprintShade } from '../draw';
import { makeOutline, syncOutline, hideOutline } from '../outline';
import { spriteBox } from '../hit';
import type { Building } from '../../core/types';

export interface BuildingView extends Container {
  sh: Graphics; outline: Container; sp: Sprite; bar: Graphics; sel: Graphics;
  baseSy: number; spriteH: number; smokeT: number; popped: boolean; _pop: number;
}

export function makeBuildingView(b: Building): BuildingView {
  const def = BUILDINGS[b.key]; const c = new Container() as BuildingView;
  c.sh = c.addChild(new Graphics());
  c.outline = c.addChild(makeOutline());           // силуэтный контур — позади спрайта
  const t = R.tex[def.img];
  const flat = !!def.farm;                          // поле — плоский плот, лежит на земле
  const sp = c.addChild(new Sprite(t)); sp.anchor.set(0.5, flat ? 0.5 : 1);
  const w = TILE.w * b.size * (flat ? 1.16 : 1.04); const sc = w / (t.width || w); sp.scale.set(sc);
  sp.y = flat ? TILE.h * b.size * 0.22 : TILE.h / 2 * b.size * 0.5;
  c.sp = sp; c.baseSy = sc; c.spriteH = sc * (t.height || 60);
  if (!flat) sp.y += (R.pad[def.img] || 0) * c.spriteH;   // опустить на пустое поле снизу PNG → стоит на земле
  if (!flat) drawFootprintShade(c.sh, b);
  c.bar = c.addChild(new Graphics());
  c.sel = c.addChild(new Graphics());
  c.smokeT = 0; c.popped = false; c._pop = 0;
  return c;
}

export function updateBuildingView(c: BuildingView, b: Building, dt: number) {
  const p = iso(b.cx, b.cy); c.position.set(p.x, p.y); c.zIndex = (b.ox + b.size - 1) + (b.oy + b.size - 1);
  c.sp.alpha = b.progress < 1 ? 0.4 + b.progress * 0.5 : 1;
  c.sp.tint = (b.key === 'wall' && G.up.stonewall) ? 0xC2C7CC : 0xffffff;
  if (b.progress >= 1 && !c.popped) { c.popped = true; c._pop = 1; }
  if (c._pop > 0) { c._pop = Math.max(0, c._pop - dt * 3); c.sp.scale.set(c.baseSy, c.baseSy * (1 + 0.14 * c._pop)); }
  else c.sp.scale.set(c.baseSy);
  c.bar.clear();
  if (b.progress < 1) drawBarG(c.bar, 0, c.sp.y - 6, TILE.w * b.size * 0.6, b.progress, 0xe7c14b);
  else if (b.hp < b.maxhp) drawBarG(c.bar, 0, c.sp.y - c.spriteH - 10, TILE.w * b.size * 0.5, b.hp / b.maxhp, 0x6fcf6f);
  const sel = G.selection.includes(b);
  c.sel.clear(); if (sel) drawDiamondSel(c.sel, b);
  // наведение — бледный контур по силуэту (у выделённого хватает ромба)
  if (G.hover === b && !sel) syncOutline(c.outline, c.sp, 0xffffff, 0.5, 3);
  else hideOutline(c.outline);
  b.hit = spriteBox(c.sp);   // весь PNG кликабелен (включая высокую крышу над тайлом)
  if (b.progress >= 1 && (b.key === 'blacksmith' || b.key === 'house' || b.key === 'townhall')) {
    c.smokeT -= dt;
    if (c.smokeT <= 0) { c.smokeT = b.key === 'blacksmith' ? 0.3 : 0.9; spawnSmoke(p.x + TILE.w * 0.12, p.y - c.spriteH * 0.82); }
  }
}
