// Призрак размещаемого здания: подсветка тайлов + полупрозрачный спрайт.
import { G, mouse } from '../core/state';
import { iso } from '../core/iso';
import { TILE } from '../data/config';
import { BUILDINGS } from '../data/buildings';
import { canPlace } from '../sim/placement';
import { canAfford } from '../sim/economy';
import { R } from './context';

export function updateGhost() {
  const gc = R.ghostC;
  if (!G.place) { gc.visible = false; return; }
  const d = BUILDINGS[G.place.key], s = d.size;
  const ox = Math.round(mouse.gx - (s - 1) / 2), oy = Math.round(mouse.gy - (s - 1) / 2);
  G.place.ox = ox; G.place.oy = oy;
  const ok = canPlace(ox, oy, s) && canAfford(d.cost);
  gc.visible = true;
  const ctr = iso(ox + (s - 1) / 2, oy + (s - 1) / 2); gc.position.set(ctr.x, ctr.y);
  const g = gc.gfx; g.clear();
  for (let y = oy; y < oy + s; y++) for (let x = ox; x < ox + s; x++) {
    const w = iso(x, y); const lx = w.x - ctr.x, ly = w.y - ctr.y;
    g.poly([lx, ly - TILE.h / 2, lx + TILE.w / 2, ly, lx, ly + TILE.h / 2, lx - TILE.w / 2, ly], true)
      .fill({ color: ok ? 0x6ec86e : 0xdc5a50, alpha: 0.42 });
  }
  const sp = gc.sp; const tx = R.tex[d.img];
  if (sp.texture !== tx) { sp.texture = tx; const w = TILE.w * s * 1.04; sp.scale.set(w / (tx.width || w)); }
  sp.y = TILE.h / 2 * s * 0.5; sp.tint = ok ? 0xffffff : 0xff8888;
}
