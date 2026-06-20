// Интеграционный регресс-тест на сообщённый баг:
// «при наведении курсора на панели UI (кнопки громкости/метрик/найма) карта начинала ехать».
// Прогоняем настоящий путь: DOM-событие pointermove (висит на window) → состояние mouse →
// cameraKeys → камера G.cam. Проверяем, что над UI камера стоит, а над картой край работает.
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { initPointer } from './pointer';
import { cameraKeys } from './keyboard';
import { mouse, G, keys } from '../core/state';

const VW = 1280, VH = 720;

// pointermove слушается на window; событие всплывает с элемента-цели (bubbles:true),
// поэтому e.target === элемент, над которым курсор (как в реальном браузере).
function move(target: Element, clientX: number, clientY: number) {
  const ev: any = new Event('pointermove', { bubbles: true });
  Object.defineProperty(ev, 'pointerType', { value: 'mouse' });
  Object.defineProperty(ev, 'clientX', { value: clientX });
  Object.defineProperty(ev, 'clientY', { value: clientY });
  target.dispatchEvent(ev);
}

beforeAll(() => {
  // #game на весь вьюпорт (в проде: position:fixed; inset:0), панель HUD поверх него
  document.body.innerHTML =
    '<canvas id="game"></canvas>' +
    '<div id="topbar"><button id="muteBtn">m</button><button id="perfBtn">p</button></div>' +
    '<div id="panel"><button id="trainBtn">воин</button></div>';
  Object.defineProperty(window, 'innerWidth', { value: VW, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: VH, configurable: true });
  initPointer();
});

beforeEach(() => {
  G.cam.x = 0; G.cam.y = 0; G.cam.zoom = 1;
  mouse.active = false; mouse.overUI = false; mouse.pan = null;
  for (const k of Object.keys(keys)) keys[k] = false;
});

const canvasEl = () => document.getElementById('game')!;

describe('камера: наведение на UI не двигает карту (регресс бага)', () => {
  it('кнопка громкости в правом-верхнем углу — камера стоит', () => {
    const btn = document.getElementById('muteBtn')!;
    move(btn, VW - 6, 5);                       // у края экрана, но курсор над кнопкой
    expect(mouse.overUI).toBe(true);
    cameraKeys(0.05);
    expect([G.cam.x, G.cam.y]).toEqual([0, 0]);
  });

  it('кнопка метрик — камера стоит', () => {
    move(document.getElementById('perfBtn')!, VW - 30, 8);
    cameraKeys(0.05);
    expect([G.cam.x, G.cam.y]).toEqual([0, 0]);
  });

  it('кнопка найма юнита в нижней панели — камера стоит', () => {
    move(document.getElementById('trainBtn')!, VW / 2, VH - 4);
    expect(mouse.overUI).toBe(true);
    cameraKeys(0.05);
    expect([G.cam.x, G.cam.y]).toEqual([0, 0]);
  });

  it('mouse.x/y берутся из clientX/clientY вьюпорта, а не из offset элемента UI', () => {
    // суть бага: offsetX относительно маленькой кнопки давал ~0 → ложный «край».
    // теперь координаты всегда вьюпортные, независимо от того, над чем курсор.
    move(document.getElementById('trainBtn')!, 777, 333);
    expect(mouse.x).toBe(777);
    expect(mouse.y).toBe(333);
  });
});

describe('камера: над картой edge-scroll по-прежнему работает', () => {
  it('курсор у левого края над канвасом двигает камеру вправо', () => {
    move(canvasEl(), 4, VH / 2);
    expect(mouse.overUI).toBe(false);
    cameraKeys(0.05);
    expect(G.cam.x).toBeGreaterThan(0);
    expect(G.cam.y).toBe(0);
  });

  it('курсор у нижнего края над канвасом двигает камеру вверх', () => {
    move(canvasEl(), VW / 2, VH - 3);
    cameraKeys(0.05);
    expect(G.cam.y).toBeLessThan(0);
  });

  it('курсор в центре карты камеру не двигает', () => {
    move(canvasEl(), VW / 2, VH / 2);
    cameraKeys(0.05);
    expect([G.cam.x, G.cam.y]).toEqual([0, 0]);
  });
});
