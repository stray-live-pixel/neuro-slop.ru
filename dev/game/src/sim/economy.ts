// Цены, ресурсы, множители добычи и параметры юнита с учётом улучшений.
import { G } from '../core/state';
import { RES } from '../data/config';
import type { Cost, ResKey, Unit, UnitStat } from '../core/types';

export function canAfford(cost: Cost): boolean {
  return RES.every(r => (G.res[r] || 0) >= (cost[r] || 0));
}
export function pay(cost: Cost) { RES.forEach(r => { if (cost[r]) G.res[r] -= cost[r]!; }); }
export function refund(cost: Cost, k: number) { RES.forEach(r => { if (cost[r]) G.res[r] += cost[r]! * k; }); }

// итоговый множитель добычи ресурса (исследования + здания-бусты)
export function gatherMult(res: ResKey): number {
  let m = 1 + (G.mult.all || 0) + (G.mult[res] || 0);
  G.buildings.forEach(b => {
    if (b.progress >= 1 && b.def.gatherBoost && b.def.gatherBoost[res]) m += b.def.gatherBoost[res]!;
  });
  return m;
}

// параметры юнита с учётом исследованных улучшений (статы + спрайт)
export function unitStat(u: Unit): UnitStat {
  const d = u.def;
  let dmg = d.dmg, range = d.range, hpBonus = 0, img = d.img;
  const armor = d.armor + (u.side === 'player' ? G.up.armor : 0);
  if (u.side === 'player') {
    if (u.type === 'militia') { dmg += G.up.meleeDmg; if (G.up.druzhina) { dmg += 4; hpBonus = 40; img = d.upImg!; } }
    if (u.type === 'archer') { dmg += G.up.archerDmg; range += G.up.archerRange; }
  }
  return { dmg, range, armor, hpBonus, img, rate: d.rate, speed: d.speed, projectile: d.projectile };
}
