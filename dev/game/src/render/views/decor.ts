// Вид декоративного объекта: статичный спрайт с маленькой контактной тенью.
// Декор не выбирается, не блокирует путь — только оживляет карту.
import { Container, Graphics, Sprite } from 'pixi.js';
import { iso } from '../../core/iso';
import { TILE, FEET } from '../../data/config';
import { R } from '../context';
import { drawGroundShadow } from '../draw';
import type { Decor } from '../../core/types';

export interface DecorView extends Container { sp: Sprite; }

// целевая высота на экране (в долях тайла) по типу декора; брёвна/мосты масштабируем по ширине.
const TARGET_H: Record<string, number> = { bush: 1.05, flowers: 0.9, haystack: 1.35, stump: 1.0 };
const starts = (img: string, prefix: string) => img.startsWith(prefix);

export function makeDecorView(d: Decor): DecorView {
  const c = new Container() as DecorView;
  const sh = c.addChild(new Graphics());
  const t = R.tex[d.img];
  const flatWater = starts(d.img, 'bridge-') || starts(d.img, 'water-lilies-');
  if (!flatWater && d.img !== 'flowers') drawGroundShadow(sh, 0, FEET, TILE.w * 0.2, TILE.h * 0.12, 0.3);
  const sp = c.addChild(new Sprite(t));
  if (starts(d.img, 'bridge-')) {
    sp.anchor.set(0.5, 0.5); sp.y = TILE.h * 0.04;
    sp.scale.set((TILE.w * 3.25) / (t.width || 1));
  } else if (starts(d.img, 'water-lilies-')) {
    sp.anchor.set(0.5, 0.5); sp.y = TILE.h * 0.04;
    sp.scale.set((TILE.w * 0.9) / (t.width || 1));
  } else {
    sp.anchor.set(0.5, 1); sp.y = FEET;
    if (d.img === 'log') sp.scale.set((TILE.w * 1.05) / (t.width || 1));
    else if (starts(d.img, 'water-reeds-')) sp.scale.set((TILE.h * 1.05) / (t.height || 1));
    else if (starts(d.img, 'shore-stones-')) sp.scale.set((TILE.w * 0.78) / (t.width || 1));
    else { const h = TILE.h * (TARGET_H[d.img] || 1.0); sp.scale.set(h / (t.height || 1)); }
  }
  const p = iso(d.gx, d.gy); c.position.set(p.x, p.y); c.zIndex = d.gx + d.gy;
  if (starts(d.img, 'bridge-')) c.zIndex += 0.35;
  else if (starts(d.img, 'water-lilies-')) c.zIndex -= 0.1;
  c.sp = sp;
  return c;
}
