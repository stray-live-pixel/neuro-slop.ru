// Типы данных игры. Один источник истины для симуляции, рендера и UI.
import type { Container } from 'pixi.js';

export type ResKey = 'food' | 'wood' | 'stone' | 'gold';
export type Side = 'player' | 'enemy';
export type EntityKind = 'unit' | 'building' | 'node';
export type Cost = Partial<Record<ResKey, number>>;

/* ----------------------------- декларативные определения ------------------ */
export interface NodeDef {
  res: ResKey;
  amount: number;
  img: string;
  label: string;
}

export interface BuildingDef {
  name: string;
  img: string;
  size: number;
  hp: number;
  build: number;
  cost: Cost;
  desc: string;
  provides?: { pop?: number };
  sight?: number;
  trains?: string[];
  research?: string[];
  gatherBoost?: Partial<Record<ResKey, number>>;
  farm?: boolean;
  wall?: boolean;
  attack?: { dmg: number; range: number; rate: number; projectile?: boolean };
}

export interface UnitDef {
  name: string;
  img: string;
  side: Side;
  pop: number;
  hp: number;
  speed: number;
  dmg: number;
  range: number;
  rate: number;
  armor: number;
  cost: Cost;
  desc: string;
  gather?: number;
  build?: number;
  trainTime?: number;
  upImg?: string;
  projectile?: boolean;
  siege?: number;
}

export interface TechDef {
  name: string;
  icon?: string;
  cost: Cost;
  desc: string;
  apply: (g: GameState) => void;
}

export interface WaveComp {
  list: string[];
  hpScale: number;
  dmgScale: number;
  reward: Cost;
}

/* ----------------------------- живые сущности ----------------------------- */
export interface PathPt { x: number; y: number; }

export interface Order {
  type: 'move' | 'gather' | 'build' | 'attack';
  target?: Entity;
  forced?: boolean;
  repath?: number;
}

export interface Unit {
  id: number;
  kind: 'unit';
  type: string;
  side: Side;
  name: string;
  gx: number;
  gy: number;
  vx: number;
  hp: number;
  maxhp: number;
  def: UnitDef;
  order: Order | null;
  path: PathPt[] | null;
  wp: number;
  cd: number;
  anim: number;
  guard: { x: number; y: number };
  gatherRes: ResKey | null;
  carry: number;
  view?: Container;
  _lunge?: number;
  _hurt?: number;
}

export interface QueueJob { kind: 'unit' | 'tech'; id: string; t: number; total: number; }
export interface Rally { x: number; y: number; node: ResourceNode | null; }

export interface Building {
  id: number;
  kind: 'building';
  key: string;
  name: string;
  def: BuildingDef;
  ox: number;
  oy: number;
  size: number;
  cx: number;
  cy: number;
  hp: number;
  maxhp: number;
  progress: number;
  queue: QueueJob[];
  cd: number;
  rally: Rally | null;
  anim: number;
  view?: Container;
  popped?: boolean;
  _pop?: number;
  _qlen?: number;
}

export interface ResourceNode {
  id: number;
  kind: 'node';
  node: string;
  res: ResKey;
  img: string;
  gx: number;
  gy: number;
  amount: number;
  max: number;
  label: string;
  view?: Container;
}

export type Entity = Unit | Building | ResourceNode;
export type Selectable = Unit | Building | ResourceNode;

// Декор карты — чисто визуальные объекты, не блокируют и не выбираются.
export interface Decor { img: string; gx: number; gy: number; view?: import('pixi.js').Container; }

export interface Projectile {
  x: number;
  y: number;
  target: Unit | Building | null;
  dmg: number;
  speed: number;
  from: Side;
  dead?: boolean;
}

export interface Fx {
  x: number;
  y: number;
  t: number;
  life: number;
  type: 'flash' | 'hit' | 'die' | 'collapse';
  color?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: number;
  grav: number;
  smoke?: boolean;
  dead?: boolean;
}

export interface Placement { key: string; ox?: number; oy?: number; }

export interface GameState {
  res: Record<ResKey, number>;
  pop: { used: number; cap: number };
  mult: { all: number; food: number; wood: number; stone: number; gold: number };
  up: {
    meleeDmg: number; armor: number; archerDmg: number; archerRange: number;
    towerDmg: number; towerRange: number; druzhina: boolean; stonewall: boolean;
  };
  researched: Set<string>;
  units: Unit[];
  buildings: Building[];
  nodes: ResourceNode[];
  decor: Decor[];                     // неинтерактивный декор (кусты, цветы, брёвна…)
  projectiles: Projectile[];
  fx: Fx[];
  particles: Particle[];
  selection: Selectable[];
  hover: Selectable | null;           // объект под курсором — подсвечивается контуром
  cam: { x: number; y: number; zoom: number };
  solid: Uint8Array[];
  tileObj: (Entity | null)[][];
  groups: Record<number, number[]>;   // контрол-группы: цифра → id юнитов
  wave: { index: number; state: 'prep' | 'active'; timer: number; alive: number; announced: boolean; side: number };
  time: number;
  paused: boolean;
  speed: number;
  over: 'win' | 'lose' | null;
  place: Placement | null;
  uid: number;
}

export interface Mouse {
  x: number;
  y: number;
  gx: number;
  gy: number;
  down: boolean;
  dragStart: { x: number; y: number } | null;
  dragRect: { x: number; y: number; w: number; h: number } | null;
  pan: { x: number; y: number; cx: number; cy: number } | null;
  active: boolean;
  moved: boolean;
  overUI: boolean;   // курсор над панелью HUD (не над игровым канвасом) — edge-scroll выключаем
}

/** Параметры юнита с учётом исследованных улучшений. */
export interface UnitStat {
  dmg: number;
  range: number;
  armor: number;
  hpBonus: number;
  img: string;
  rate: number;
  speed: number;
  projectile?: boolean;
}
