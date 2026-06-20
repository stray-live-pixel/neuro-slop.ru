// Призрак размещаемого здания: подсветка тайлов + полупрозрачный спрайт.
// Частокол можно тянуть линией (Shift-режим линии) — тогда подсвечиваем все её тайлы.
import { G, mouse } from '../core/state';
import { iso } from '../core/iso';
import { TILE } from '../data/config';
import { BUILDINGS } from '../data/buildings';
import { canPlace, wallLineCells } from '../sim/placement';
import { canAfford } from '../sim/economy';
import { R } from './context';

function tileDiamond(g: import('pixi.js').Graphics, cx: number, cy: number, wx: number, wy: number, ok: boolean) {
  const lx = wx - cx, ly = wy - cy;
  g.poly([lx, ly - TILE.h / 2, lx + TILE.w / 2, ly, lx, ly + TILE.h / 2, lx - TILE.w / 2, ly], true)
    .fill({ color: ok ? 0x6ec86e : 0xdc5a50, alpha: 0.42 });
}

export function updateGhost() {
  const gc = R.ghostC;
  if (!G.place) { gc.visible = false; return; }
  const d = BUILDINGS[G.place.key], s = d.size;
  const ox = Math.round(mouse.gx - (s - 1) / 2), oy = Math.round(mouse.gy - (s - 1) / 2);
  G.place.ox = ox; G.place.oy = oy;
  gc.visible = true;
  const g = gc.gfx; g.clear();

  // частокол линией: тянем от якоря к курсору — подсвечиваем все тайлы линии
  if (G.place.key === 'wall' && G.place.line) {
    const cells = wallLineCells(G.place.line.ax, G.place.line.ay, Math.round(mouse.gx), Math.round(mouse.gy));
    const ctr = iso(Math.round(mouse.gx), Math.round(mouse.gy)); gc.position.set(ctr.x, ctr.y);
    const aff = canAfford(d.cost);
    for (const c of cells) { const w = iso(c.x, c.y); tileDiamond(g, ctr.x, ctr.y, w.x, w.y, canPlace(c.x, c.y, 1) && aff); }
    const sp = gc.sp; const tx = R.tex[d.img];
    if (sp.texture !== tx) { sp.texture = tx; const w = TILE.w * 1.04; sp.scale.set(w / (tx.width || w)); }
    sp.y = TILE.h / 2 * 0.5 + (R.pad[d.img] || 0) * sp.scale.y * (tx.height || 0);
    sp.tint = 0xffffff;
    return;
  }

  const ok = canPlace(ox, oy, s) && canAfford(d.cost);
  const ctr = iso(ox + (s - 1) / 2, oy + (s - 1) / 2); gc.position.set(ctr.x, ctr.y);
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    const w = iso(x, y); tileDiamond(g, ctr.x, ctr.y, w.x, w.y, ok);
  }
  const sp = gc.sp; const tx = R.tex[d.img];
  if (sp.texture !== tx) { sp.texture = tx; const w = TILE.w * s * 1.04; sp.scale.set(w / (tx.width || w)); }
  // тот же сдвиг на пустое поле снизу PNG, что и у поставленного здания — превью совпадает
  sp.y = TILE.h / 2 * s * 0.5 + (R.pad[d.img] || 0) * sp.scale.y * (tx.height || 0);
  sp.tint = ok ? 0xffffff : 0xff8888;
}
