// Изометрическая «карандашная» земля — строится один раз.
import { iso } from '../core/iso';
import { MAP, TILE } from '../data/config';
import { R } from './context';

// Подмешать тон к белому (f>0, свет) или к чёрному (f<0, тень).
function shade(hex: number, f: number): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const to = f >= 0 ? 255 : 0, k = Math.min(1, Math.abs(f));
  const mix = (c: number) => Math.round(c + (to - c) * k);
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}

export function buildGround() {
  const g = R.groundG;
  g.clear();
  const TW2 = TILE.w / 2, TH2 = TILE.h / 2;
  const tones = [0xb7cd92, 0xb1c98b, 0xbcd197, 0xaac384, 0xb4cb8e];
  const span = MAP.W + MAP.H - 2;
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const p = iso(x, y);
    // мягкий направленный свет: дальний (верхний) край ярче, ближний — темнее,
    // в одну сторону с контактными тенями объектов → сцена читается как «под солнцем».
    const lf = 0.07 - (x + y) / span * 0.18;
    const tone = shade(tones[(x * 7 + y * 13) % 5], lf);
    const top = shade(tone, 0.06);    // блик по верхним граням ромба
    g.poly([p.x, p.y - TH2, p.x + TW2, p.y, p.x, p.y + TH2, p.x - TW2, p.y], true)
      .fill(tone).stroke({ width: 1, color: 0x6f7e52, alpha: 0.18 });
    // тонкая фаска: светлая верхняя кромка даёт тайлам форму, поверхность перестаёт быть плоской
    g.moveTo(p.x - TW2, p.y).lineTo(p.x, p.y - TH2).lineTo(p.x + TW2, p.y)
      .stroke({ width: 1, color: top, alpha: 0.5 });
  }
  // лёгкая «карандашная» трава для объёма (одним штрихом)
  let seed = 1234;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1100; i++) {
    const p = iso(rnd() * MAP.W, rnd() * MAP.H);
    g.moveTo(p.x, p.y).lineTo(p.x - 2, p.y - 5);
    g.moveTo(p.x + 2, p.y).lineTo(p.x + 3, p.y - 5);
  }
  g.stroke({ width: 1.3, color: 0x8aa566, alpha: 0.45 });
}
