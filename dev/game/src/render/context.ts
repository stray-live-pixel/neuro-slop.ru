// Контекст рендера PixiJS v8: приложение, слои сцены, кэш текстур.
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { renderResolution } from '../core/settings';
import { sizeVignette, makeVignette } from './vignette';

export interface GhostContainer extends Container { gfx: Graphics; sp: Sprite; }

export interface RenderContext {
  app: Application;
  world: Container;        // камера: позиция + масштаб
  groundG: Graphics;       // изо-земля (рисуется один раз)
  cloudG: Graphics;        // дрейфующие тени облаков (под объектами)
  objLayer: Container;     // depth-сортируемые объекты
  fxG: Graphics;           // частицы/снаряды/вспышки (мировое пространство)
  ghostC: GhostContainer;  // призрак стройки
  dragG: Graphics;         // рамка выделения (экранное пространство)
  vignette: Sprite;        // затемнение по краям
  tex: Record<string, Texture>;
  pad: Record<string, number>;   // доля прозрачного поля снизу текстуры (посадка «на землю»)
  badge: Record<string, Texture | null>;
}

export const R: RenderContext = {
  tex: {}, pad: {}, badge: {},
} as RenderContext;

const canvas = () => document.getElementById('game') as HTMLCanvasElement;

export async function initPixi() {
  const VW = window.innerWidth, VH = window.innerHeight;
  const app = new Application();
  await app.init({
    canvas: canvas(),
    width: VW, height: VH,
    antialias: true,                 // MSAA-сглаживание краёв геометрии
    resolution: renderResolution(),  // плотность экрана при сглаживании, иначе 1 (настройка)
    autoDensity: true,
    background: 0xc7b89a,
    preference: 'webgl',             // стабильный путь (без WebGPU-различий)
    powerPreference: 'high-performance',
  });
  app.stop();                        // свой rAF-цикл вместо тикера Pixi
  R.app = app;

  R.world = new Container(); app.stage.addChild(R.world);
  R.groundG = new Graphics(); R.world.addChild(R.groundG);
  R.cloudG = new Graphics(); R.world.addChild(R.cloudG);
  R.objLayer = new Container(); R.objLayer.sortableChildren = true; R.world.addChild(R.objLayer);
  R.fxG = new Graphics(); R.world.addChild(R.fxG);

  const ghostC = new Container() as GhostContainer;
  ghostC.visible = false; R.world.addChild(ghostC);
  ghostC.gfx = ghostC.addChild(new Graphics());
  ghostC.sp = ghostC.addChild(new Sprite()); ghostC.sp.anchor.set(0.5, 1); ghostC.sp.alpha = 0.7;
  R.ghostC = ghostC;

  R.dragG = new Graphics(); app.stage.addChild(R.dragG);   // экранное пространство

  R.vignette = makeVignette(); app.stage.addChild(R.vignette);
  sizeVignette();
}

export function resizeRenderer() {
  if (!R.app) return;
  // третий аргумент — плотность рендера; применяет и ресайз окна, и смену сглаживания
  R.app.renderer.resize(window.innerWidth, window.innerHeight, renderResolution());
  sizeVignette();
}
