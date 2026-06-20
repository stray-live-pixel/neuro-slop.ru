// Виньетка по краям экрана — добавляет объём сцене.
import { Sprite, Texture } from 'pixi.js';
import { R } from './context';

export function makeVignette(): Sprite {
  const s = new Sprite(Texture.WHITE);
  s.tint = 0x000000;
  return s;
}

export function sizeVignette() {
  const v = R.vignette;
  if (!v) return;
  const VW = window.innerWidth, VH = window.innerHeight;
  const cv = document.createElement('canvas'); cv.width = VW; cv.height = VH;
  const g = cv.getContext('2d')!;
  const grad = g.createRadialGradient(VW / 2, VH * 0.46, Math.min(VW, VH) * 0.25, VW / 2, VH * 0.5, Math.max(VW, VH) * 0.72);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(35,24,12,0.42)');
  g.fillStyle = grad; g.fillRect(0, 0, VW, VH);
  const old = v.texture;
  v.texture = Texture.from(cv);
  v.tint = 0xffffff; v.width = VW; v.height = VH; v.alpha = 1;
  if (old && old !== Texture.WHITE) old.destroy(true);
}
