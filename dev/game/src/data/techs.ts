/* ---- УЛУЧШЕНИЯ (исследования) ----
   apply(G) меняет глобальные флаги/множители. Многие влияют на ВИД юнитов/зданий. */
import type { TechDef } from '../core/types';

export const TECHS: Record<string, TechDef> = {
  // экономика
  wheel:    { name: 'Тачка', cost: { food: 150, wood: 100 },
              desc: '+20% ко всей добыче ресурсов.', apply: G => { G.mult.all += 0.2; } },
  saw:      { name: 'Двуручная пила', cost: { food: 120, wood: 60 },
              desc: '+33% к добыче дерева.', apply: G => { G.mult.wood += 0.33; } },
  picks:    { name: 'Стальные кирки', cost: { food: 120, wood: 120 },
              desc: '+33% к добыче камня и золота.', apply: G => { G.mult.stone += 0.33; G.mult.gold += 0.33; } },
  plough:   { name: 'Тяжёлый плуг', cost: { food: 120, wood: 90 },
              desc: '+33% к добыче еды.', apply: G => { G.mult.food += 0.33; } },
  // военные — меняют статы и вид
  swords:   { name: 'Кованые мечи', cost: { food: 120, gold: 60 },
              desc: '+3 к атаке пехоты.', apply: G => { G.up.meleeDmg += 3; } },
  mail:     { name: 'Кольчуга', cost: { food: 120, gold: 60 },
              desc: '+2 к броне всех воинов.', apply: G => { G.up.armor += 2; } },
  arrows:   { name: 'Калёные стрелы', cost: { wood: 120, gold: 80 },
              desc: '+2 к атаке и +1 к дальности лучников.', apply: G => { G.up.archerDmg += 2; G.up.archerRange += 1; } },
  druzhina: { name: 'Дружина', cost: { food: 220, gold: 160 },
              desc: 'Ополченцы становятся дружинниками: тяжёлая броня и меч (новый вид, +40 HP, +4 атаки).',
              apply: G => { G.up.druzhina = true; } },
  // оборона — меняют вид зданий
  stonewall:{ name: 'Каменная кладка', cost: { stone: 200 },
              desc: 'Частоколы укрепляются камнем: +80% прочности и новый вид.',
              apply: G => { G.up.stonewall = true; } },
  watch:    { name: 'Сторожевая служба', cost: { wood: 150, gold: 50 },
              desc: 'Башни: +1.5 к дальности и +4 к урону.',
              apply: G => { G.up.towerRange += 1.5; G.up.towerDmg += 4; } },
};

// Иконка-улучшение для UI (имя lucide-иконки).
export const TECH_ICON: Record<string, string> = {
  wheel: 'up', saw: 'axe', picks: 'pickaxe', plough: 'sprout', swords: 'swords',
  mail: 'shield', arrows: 'target', druzhina: 'crown', stonewall: 'wall', watch: 'eye',
};
