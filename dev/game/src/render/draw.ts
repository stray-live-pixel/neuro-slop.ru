// Общие рисовалки на Graphics (Pixi v8 path → fill/stroke).
import { Graphics } from 'pixi.js';
import { iso, clamp } from '../core/iso';
import type { Building } from '../core/types';

export function drawBarG(g: Graphics, cx: number, topY: number, w: number, frac: number, color: number) {
  g.rect(cx - w / 2, topY, w, 4).fill({ color: 0x14140e, alpha: 0.62 });
  g.rect(cx - w / 2, topY, w * clamp(frac, 0, 1), 4).fill(color);
}

// Контактная тень на земле (для динамичных юнитов): небольшой плотный эллипс,
// поджатый под объект — компактная тень у самых «ног» создаёт ощущение контакта.
const SHADOW_COL = 0x222a1a;
export function drawGroundShadow(g: Graphics, cx: number, cy: number, rx: number, ry: number, alpha = 0.36) {
  const ox = rx * 0.04, oy = ry * 0.08;            // едва заметная растяжка полутени по свету
  g.ellipse(cx + ox, cy + oy, rx, ry).fill({ color: SHADOW_COL, alpha: alpha * 0.5 });
  g.ellipse(cx, cy, rx * 0.6, ry * 0.6).fill({ color: SHADOW_COL, alpha });
}

// Для статичных объектов (здания, ресурсы) — затемняем сам тайл(ы) земли под
// объектом, а не рисуем круглую тень: ромб footprint'а просто становится темнее.
const TILE_SHADE = 0x20281a;
// Один тайл, в локальных координатах контейнера (центр тайла = 0,0).
export function drawTileShade(g: Graphics, hw: number, hh: number, alpha = 0.28) {
  g.poly([0, -hh, hw, 0, 0, hh, -hw, 0], true).fill({ color: TILE_SHADE, alpha });
}
// Footprint здания size×size: затемнённый ромб по габаритам застройки (с лёгким отступом).
export function drawFootprintShade(g: Graphics, b: Building, alpha = 0.28) {
  const ctr = iso(b.cx, b.cy);
  const pts = [
    [b.ox - 0.5, b.oy - 0.5], [b.ox + b.size - 0.5, b.oy - 0.5],
    [b.ox + b.size - 0.5, b.oy + b.size - 0.5], [b.ox - 0.5, b.oy + b.size - 0.5],
  ];
  pts.forEach((pt, i) => { const w = iso(pt[0], pt[1]); const lx = (w.x - ctr.x) * 0.94, ly = (w.y - ctr.y) * 0.94; i ? g.lineTo(lx, ly) : g.moveTo(lx, ly); });
  g.closePath().fill({ color: TILE_SHADE, alpha });
}

export function drawDiamondSel(g: Graphics, b: Building) {
  const ctr = iso(b.cx, b.cy);
  const pts = [
    [b.ox - 0.5, b.oy - 0.5], [b.ox + b.size - 0.5, b.oy - 0.5],
    [b.ox + b.size - 0.5, b.oy + b.size - 0.5], [b.ox - 0.5, b.oy + b.size - 0.5],
  ];
  pts.forEach((pt, i) => { const w = iso(pt[0], pt[1]); const lx = w.x - ctr.x, ly = w.y - ctr.y; i ? g.lineTo(lx, ly) : g.moveTo(lx, ly); });
  g.closePath().stroke({ width: 2.2, color: 0xffe89a, alpha: 0.95 });
}
