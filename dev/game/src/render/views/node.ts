// Вид ресурсного узла: тень + спрайт, прозрачность по остатку.
import { Container, Graphics, Sprite } from 'pixi.js';
import { iso } from '../../core/iso';
import { TILE, FEET } from '../../data/config';
import { R } from '../context';
import type { ResourceNode } from '../../core/types';

export interface NodeView extends Container { sh: Graphics; sp: Sprite; }

export function makeNodeView(n: ResourceNode): NodeView {
  const c = new Container() as NodeView;
  c.sh = c.addChild(new Graphics());
  c.sh.ellipse(0, FEET, TILE.w * 0.32, TILE.h * 0.28).fill({ color: 0x33301f, alpha: 0.16 });
  const t = R.tex[n.img];
  const sp = c.addChild(new Sprite(t)); sp.anchor.set(0.5, 0.94);
  const w = TILE.w * 1.12; sp.scale.set(w / (t.width || w)); c.sp = sp;
  return c;
}

export function updateNodeView(c: NodeView, n: ResourceNode) {
  const p = iso(n.gx, n.gy); c.position.set(p.x, p.y); c.zIndex = n.gx + n.gy;
  c.sp.alpha = 0.55 + 0.45 * (n.amount / n.max);
}
