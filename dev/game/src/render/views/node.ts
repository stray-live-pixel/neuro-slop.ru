// Вид ресурсного узла: затемнённый тайл земли + спрайт, прозрачность по остатку.
import { Container, Graphics, Sprite } from 'pixi.js';
import { G } from '../../core/state';
import { iso } from '../../core/iso';
import { TILE } from '../../data/config';
import { R } from '../context';
import { drawTileShade } from '../draw';
import { makeOutline, syncOutline, hideOutline } from '../outline';
import { spriteBox } from '../hit';
import type { ResourceNode } from '../../core/types';

export interface NodeView extends Container { sh: Graphics; outline: Container; sp: Sprite; }

// виды деревьев в лесу (взвешенно: зелёных больше, осеннее реже)
const TREE_VARIANTS = ['tree', 'tree', 'tree-oak', 'tree-oak', 'tree-pine', 'tree-pine', 'tree-autumn'];

export function makeNodeView(n: ResourceNode): NodeView {
  const c = new Container() as NodeView;
  c.sh = c.addChild(new Graphics());
  drawTileShade(c.sh, TILE.w * 0.46, TILE.h * 0.46);
  c.outline = c.addChild(makeOutline());           // силуэтный контур — позади спрайта
  const isTree = n.img === 'tree';
  const isOre = n.img === 'rocks' || n.img === 'gold';
  // лес: разные виды деревьев для разнообразия (детерминированно по id узла)
  const img = isTree ? TREE_VARIANTS[n.id % TREE_VARIANTS.length] : n.img;
  const t = R.tex[img] || R.tex[n.img];
  const sp = c.addChild(new Sprite(t)); sp.anchor.set(0.5, 1);
  sp.y = TILE.h * (isOre ? 0.4 : 0.16);            // руду опускаем ещё ниже — сидит на земле
  if (isTree) {                                    // деревья крупные, по целевой высоте (≈×2)
    const targetH = TILE.h * 2.7; sp.scale.set(targetH / (t.height || targetH));
  } else {
    const w = TILE.w * 1.12; sp.scale.set(w / (t.width || w));
  }
  sp.y += (R.pad[img] || 0) * sp.scale.y * (t.height || 0);   // опустить на пустое поле снизу PNG
  c.sp = sp;
  return c;
}

export function updateNodeView(c: NodeView, n: ResourceNode) {
  const p = iso(n.gx, n.gy); c.position.set(p.x, p.y); c.zIndex = n.gx + n.gy;
  c.sp.alpha = 0.55 + 0.45 * (n.amount / n.max);
  // контур по силуэту: выделение — белый, наведение — бледный
  if (G.selection.includes(n)) syncOutline(c.outline, c.sp, 0xffffff, 1, 3);
  else if (G.hover === n) syncOutline(c.outline, c.sp, 0xffffff, 0.5, 3);
  else hideOutline(c.outline);
  n.hit = spriteBox(c.sp);   // весь PNG кликабелен (дерево/руда выше своего тайла)
}
