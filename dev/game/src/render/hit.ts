// Бокс PNG-ассета по текущему спрайту (в локальных px контейнера) — кешируется
// в сущность каждый кадр, чтобы клик/рамка попадали по всему ассету, а не по точке.
import type { Sprite } from 'pixi.js';
import type { HitBox } from '../core/types';

export function spriteBox(sp: Sprite, cx = sp.x): HitBox {
  const w = Math.abs(sp.scale.x) * (sp.texture.width || 0);
  const h = Math.abs(sp.scale.y) * (sp.texture.height || 0);
  return { cx, hw: w / 2, top: sp.y - sp.anchor.y * h, bot: sp.y + (1 - sp.anchor.y) * h };
}
