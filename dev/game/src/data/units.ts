/* ---- ЮНИТЫ ----
   speed — тайлов/сек. range — радиус атаки (0.9 = ближний бой).
   tier-апгрейды (дружина) применяются глобально и меняют вид/статы.          */
import type { UnitDef } from '../core/types';

export const UNITS: Record<string, UnitDef> = {
  peasant: {
    name: 'Крестьянин', img: 'peasant', side: 'player', pop: 1,
    hp: 45, speed: 2.3, dmg: 3, range: 0.9, rate: 1.3, armor: 0,
    gather: 0.9, build: 1, cost: { food: 50 }, trainTime: 11,
    desc: 'Добывает ресурсы и строит. Слаб в бою.',
  },
  militia: {
    name: 'Ополченец', img: 'militia', side: 'player', pop: 1,
    hp: 70, speed: 2.0, dmg: 8, range: 0.9, rate: 1.2, armor: 1,
    cost: { food: 60, gold: 20 }, trainTime: 15,
    upImg: 'druzhina', // вид после улучшения «Дружина»
    desc: 'Пеший воин ближнего боя. Костяк обороны.',
  },
  archer: {
    name: 'Лучник', img: 'archer', side: 'player', pop: 1,
    hp: 45, speed: 2.0, dmg: 6, range: 5.2, rate: 1.6, armor: 0, projectile: true,
    cost: { wood: 40, gold: 35 }, trainTime: 17,
    desc: 'Стрелок. Бьёт издали, но хрупок.',
  },
  // Враги (орда)
  mongol: {
    name: 'Монгол', img: 'mongol', side: 'enemy', pop: 0,
    hp: 80, speed: 1.9, dmg: 9, range: 0.9, rate: 1.2, armor: 0,
    siege: 3, // бонус урона по зданиям
    cost: {}, desc: 'Пехота орды.',
  },
  rider: {
    name: 'Всадник орды', img: 'mongol-rider', side: 'enemy', pop: 0,
    hp: 120, speed: 2.8, dmg: 11, range: 0.9, rate: 1.1, armor: 1,
    siege: 2, cost: {}, desc: 'Конница орды — быстрая и живучая.',
  },
};
