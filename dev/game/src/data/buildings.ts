/* ---- ЗДАНИЯ ----
   size — сторона квадратного основания в тайлах.
   build — время постройки (сек) для одного крестьянина.
   provides.pop — прибавка к лимиту населения.
   gatherBoost — пассивный множитель добычи ресурса при наличии здания.
   trains / research — что доступно из здания.                                */
import type { BuildingDef } from '../core/types';
import { START_POP_CAP } from './config';

export const BUILDINGS: Record<string, BuildingDef> = {
  townhall: {
    name: 'Ратуша', img: 'townhall', size: 3, hp: 2400, build: 0,
    cost: {}, provides: { pop: START_POP_CAP }, sight: 8,
    trains: ['peasant'], research: ['wheel', 'stonewall', 'watch'],
    desc: 'Сердце города. Готовит крестьян и хранит ресурсы.',
  },
  house: {
    name: 'Изба', img: 'house', size: 2, hp: 500, build: 16,
    cost: { wood: 30 }, provides: { pop: 10 },
    desc: '+10 к лимиту населения.',
  },
  farm: {
    name: 'Поле', img: 'field', size: 2, hp: 200, build: 14,
    cost: { wood: 60 }, farm: true,
    desc: 'Возобновляемый источник еды — крестьяне жнут бесконечно.',
  },
  lumbermill: {
    name: 'Лесопилка', img: 'lumbermill', size: 2, hp: 700, build: 22,
    cost: { wood: 100 }, gatherBoost: { wood: 0.25 },
    research: ['saw'], desc: '+25% к добыче дерева. Улучшения дровосеков.',
  },
  mine: {
    name: 'Рудник', img: 'mine', size: 2, hp: 700, build: 22,
    cost: { wood: 100 }, gatherBoost: { stone: 0.25, gold: 0.25 },
    research: ['picks'], desc: '+25% к добыче камня и золота. Улучшения шахтёров.',
  },
  granary: {
    name: 'Амбар', img: 'granary', size: 2, hp: 700, build: 22,
    cost: { wood: 120 }, gatherBoost: { food: 0.25 },
    research: ['plough'], desc: '+25% к добыче еды. Открывает Поля и улучшения.',
  },
  barracks: {
    name: 'Казармы', img: 'barracks', size: 3, hp: 1400, build: 30,
    cost: { wood: 175 }, trains: ['militia', 'archer'],
    desc: 'Готовит ополченцев и лучников для защиты города.',
  },
  blacksmith: {
    name: 'Кузница', img: 'blacksmith', size: 2, hp: 1100, build: 28,
    cost: { wood: 150 }, research: ['swords', 'mail', 'arrows', 'druzhina'],
    desc: 'Изучает воинские улучшения: оружие, броню, дружину.',
  },
  tower: {
    name: 'Башня', img: 'tower', size: 2, hp: 2200, build: 26,
    cost: { wood: 90, stone: 220 },
    attack: { dmg: 27, range: 7, rate: 1.1, projectile: true }, sight: 9,
    desc: 'Большая башня 2×2. Сама стреляет по врагам в радиусе — втрое сильнее. Каменная защита.',
  },
  wall: {
    name: 'Частокол', img: 'wall', size: 1, hp: 1000, build: 6,
    cost: { stone: 20 }, wall: true,
    desc: 'Преграда. Орда ломает стены, чтобы прорваться.',
  },
};

// Порядок кнопок в меню строительства (у крестьянина).
export const BUILD_MENU = ['house', 'farm', 'lumbermill', 'mine', 'granary', 'barracks', 'blacksmith', 'tower', 'wall'];
