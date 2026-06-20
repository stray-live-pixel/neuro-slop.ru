// Вид ресурсного узла: затемнённый тайл земли + спрайт, прозрачность по остатку.
import { Container, Graphics, Sprite } from 'pixi.js';
import { iso } from '../../core/iso';
import { TILE } from '../../data/config';
import { R } from '../context';
import { drawTileShade } from '../draw';
import type { ResourceNode } from '../../core/types';

export interface NodeView extends Container { sh: Graphics; sp: Sprite; }

export function makeNodeView(n: ResourceNode): NodeView {
  const c = new Container() as NodeView;
  c.sh = c.addChild(new Graphics());
  drawTileShade(c.sh, TILE.w * 0.46, TILE.h * 0.46);
  const t = R.tex[n.img];
  const sp = c.addChild(new Sprite(t)); sp.anchor.set(0.5, 1);
  const isTree = n.img === 'tree';
  const isOre = n.img === 'rocks' || n.img === 'gold';
  sp.y = TILE.h * (isOre ? 0.4 : 0.2);             // руду опускаем ещё ниже — сидит на земле
  const w = TILE.w * 1.12 * (isTree ? 2 : 1);      // деревья крупнее ×2
  sp.scale.set(w / (t.width || w)); c.sp = sp;
  return c;
}

export function updateNodeView(c: NodeView, n: ResourceNode) {
  const p = iso(n.gx, n.gy); c.position.set(p.x, p.y); c.zIndex = n.gx + n.gy;
  c.sp.alpha = 0.55 + 0.45 * (n.amount / n.max);
}
