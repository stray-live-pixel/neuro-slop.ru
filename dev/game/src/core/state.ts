// Глобальное изменяемое состояние игры — единственный экземпляр на всю сессию.
import type { GameState, Mouse } from './types';
import { START_RES } from '../data/config';

function createState(): GameState {
  return {
    res: { ...START_RES },
    pop: { used: 0, cap: 0 },
    mult: { all: 0, food: 0, wood: 0, stone: 0, gold: 0 },
    up: { meleeDmg: 0, armor: 0, archerDmg: 0, archerRange: 0, towerDmg: 0, towerRange: 0, druzhina: false, stonewall: false },
    researched: new Set<string>(),
    units: [], buildings: [], nodes: [], projectiles: [], fx: [], particles: [],
    selection: [],
    cam: { x: 0, y: 0, zoom: 1 },
    solid: [], tileObj: [],
    groups: {},
    wave: { index: 0, state: 'prep', timer: 270, alive: 0, announced: false, side: Math.floor(Math.random() * 4) },
    time: 0, paused: false, speed: 1, over: null,
    place: null,
    uid: 1,
  };
}

export const G: GameState = createState();

export const mouse: Mouse = {
  x: 0, y: 0, gx: 0, gy: 0, down: false,
  dragStart: null, dragRect: null, pan: null, active: false, moved: false,
};

export const keys: Record<string, boolean> = {};

// Доступ из консоли/безголовых тестов.
declare global {
  interface Window { __G: GameState; }
}
window.__G = G;
