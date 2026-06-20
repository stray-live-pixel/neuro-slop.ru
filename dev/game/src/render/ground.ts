// Изометрическая «карандашная» земля — строится один раз.
import { iso } from '../core/iso';
import { MAP, TILE } from '../data/config';
import { R } from './context';

export function buildGround() {
  const g = R.groundG;
  g.clear();
  const TW2 = TILE.w / 2, TH2 = TILE.h / 2;
  const tones = [0xb7cd92, 0xb1c98b, 0xbcd197, 0xaac384, 0xb4cb8e];
  for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
    const p = iso(x, y); const tone = tones[(x * 7 + y * 13) % 5];
    g.poly([p.x, p.y - TH2, p.x + TW2, p.y, p.x, p.y + TH2, p.x - TW2, p.y], true)
      .fill(tone).stroke({ width: 1, color: 0x7d8c5f, alpha: 0.16 });
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
