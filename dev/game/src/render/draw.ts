// Общие рисовалки на Graphics (Pixi v8 path → fill/stroke).
import { Graphics } from 'pixi.js';
import { iso, clamp } from '../core/iso';
import type { Building } from '../core/types';

export function drawBarG(g: Graphics, cx: number, topY: number, w: number, frac: number, color: number) {
  g.rect(cx - w / 2, topY, w, 4).fill({ color: 0x14140e, alpha: 0.62 });
  g.rect(cx - w / 2, topY, w * clamp(frac, 0, 1), 4).fill(color);
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
