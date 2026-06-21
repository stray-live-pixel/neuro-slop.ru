// Базовые константы мира и рендера.
import type { ResKey } from '../core/types';

export const MAP = { W: 46, H: 46 };          // размер карты в тайлах
export const TILE = { w: 96, h: 48 };          // изометрический тайл (2:1)
export const BUILDING_ASSET_SCALE = 0.8;       // визуальный масштаб зданий на карте
export const RESOURCE_ORE_ASSET_SCALE = 0.65;  // визуальный масштаб камня и золота
export const RESOURCE_BERRY_ASSET_SCALE = 0.65; // визуальный масштаб ягодных кустов
export const START_POP_CAP = 8;                // база от ратуши
export const MAX_POP = 200;
export const TOTAL_WAVES = 10;

export const RES: ResKey[] = ['food', 'wood', 'stone', 'gold'];
export const RES_NAME: Record<ResKey, string> = { food: 'Еда', wood: 'Дерево', stone: 'Камень', gold: 'Золото' };
export const START_RES: Record<ResKey, number> = { food: 300, wood: 320, stone: 150, gold: 120 };

export const REACH = 1.6;          // радиус «дотянуться» для добычи/стройки (учитывает диагональ 1.414)
export const FEET = TILE.h * 0.16; // юнит «стоит» чуть ниже центра тайла

// Плотность рендера — настройка «Сглаживание» (core/settings.renderResolution).

// Базовый путь (Vite base) и сборка URL спрайтов — работает и в подкаталоге /lab/gardarika/.
export const BASE = import.meta.env.BASE_URL;
export const assetUrl = (name: string) => `${BASE}assets/${name}.webp`;
