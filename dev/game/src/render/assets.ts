// Загрузка спрайтов и текстур-бейджей действий.
import { Assets, Texture } from 'pixi.js';
import { assetUrl } from '../data/config';
import { iconSVG } from '../ui/icons';
import { R } from './context';

const ASSET_LIST = ['townhall', 'house', 'granary', 'lumbermill', 'mine', 'barracks', 'blacksmith', 'tower', 'wall',
  'tree', 'rocks', 'gold', 'berries', 'peasant', 'militia', 'druzhina', 'archer', 'mongol', 'mongol-rider'];

// бейджи действий над юнитом — иконки lucide как текстуры
const BADGE_LIST = ['axe', 'pickaxe', 'food', 'hammer', 'swords'];

function makeIconTexture(name: string, color: string, px: number): Promise<Texture | null> {
  const svg = iconSVG(name, px, color, 2.4);
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return new Promise(res => {
    const img = new Image();
    img.onload = () => res(Texture.from(img));
    img.onerror = () => res(null);
    img.src = url;
  });
}

export async function loadAssets() {
  await Promise.all(ASSET_LIST.map(async n => {
    try { R.tex[n] = await Assets.load(assetUrl(n)); } catch { R.tex[n] = Texture.EMPTY; }
  }));
  await Promise.all(BADGE_LIST.map(async k => { R.badge[k] = await makeIconTexture(k, '#fff', 44); }));
}
