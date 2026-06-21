// Загрузка спрайтов и текстур-бейджей действий.
import { Assets, Texture } from 'pixi.js';
import { assetUrl } from '../data/config';
import { iconSVG } from '../ui/icons';
import { R } from './context';

// Доля пустого (прозрачного) поля снизу PNG. Спрайты заякорены за нижний край
// картинки, но у части ассетов под объектом есть прозрачные пиксели — из-за них
// объект «висит» над землёй. Меряем один раз при загрузке и опускаем спрайт на
// эту долю в видах — так у любого ассета (в т.ч. будущего) ноги стоят на земле.
function measureBottomPad(tex: Texture): number {
  try {
    const src = tex.source?.resource as CanvasImageSource | undefined;
    if (!src) return 0;
    const iw = (src as any).width || (src as any).naturalWidth || 0;
    const ih = (src as any).height || (src as any).naturalHeight || 0;
    if (!iw || !ih) return 0;
    const s = Math.min(1, 256 / ih);                 // мерим на уменьшенной копии — дёшево
    const w = Math.max(1, Math.round(iw * s)), h = Math.max(1, Math.round(ih * s));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let y = h - 1; y >= 0; y--)
      for (let x = 0; x < w; x++)
        if (data[(y * w + x) * 4 + 3] > 12) return (h - 1 - y) / h;  // нашли нижний контентный ряд
    return 0;
  } catch { return 0; }
}

const ASSET_LIST = ['townhall', 'house', 'granary', 'field', 'lumbermill', 'mine', 'barracks', 'blacksmith', 'tower', 'wall-post',
  'tree', 'tree-oak', 'tree-pine', 'tree-autumn', 'rocks', 'gold', 'berries', 'peasant', 'militia', 'druzhina', 'archer', 'mongol', 'mongol-rider',
  'bush', 'flowers', 'log', 'haystack', 'stump',
  'bridge-1', 'bridge-2', 'bridge-3',
  'water-reeds-1', 'water-reeds-2', 'water-reeds-3',
  'water-lilies-1', 'water-lilies-2', 'water-lilies-3',
  'shore-stones-1', 'shore-stones-2', 'shore-stones-3', 'shore-stones-4'];

// бейджи действий над юнитом — иконки lucide как текстуры
const BADGE_LIST = ['axe', 'pickaxe', 'food', 'hammer', 'swords', 'idle'];

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
    R.pad[n] = measureBottomPad(R.tex[n]);
  }));
  await Promise.all(BADGE_LIST.map(async k => { R.badge[k] = await makeIconTexture(k, '#fff', 44); }));
}
