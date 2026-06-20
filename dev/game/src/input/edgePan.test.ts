// Регресс-тесты edge-scroll камеры.
// Баг, который тут зафиксирован: карта ехала, когда курсор наводился на панели UI
// (кнопки громкости/метрик/найма). Edge-scroll должен срабатывать ТОЛЬКО когда курсор
// реально у края игрового поля и не над UI, не во время drag-пана и не на тач-устройстве.
import { describe, it, expect } from 'vitest';
import { edgePan, type EdgePanInput } from './edgePan';

const VW = 1920, VH = 1080;
const base: EdgePanInput = {
  x: VW / 2, y: VH / 2,            // центр экрана
  active: true, overUI: false, panning: false, touch: false,
  vw: VW, vh: VH, zoom: 1, dt: 0.016,
};

describe('edgePan: срабатывание у края', () => {
  it('у левого края двигает камеру вправо (dx > 0)', () => {
    const r = edgePan({ ...base, x: 5 });
    expect(r.dx).toBeGreaterThan(0);
    expect(r.dy).toBe(0);
  });

  it('у правого края двигает камеру влево (dx < 0)', () => {
    const r = edgePan({ ...base, x: VW - 5 });
    expect(r.dx).toBeLessThan(0);
  });

  it('у верхнего края двигает камеру вниз (dy > 0)', () => {
    const r = edgePan({ ...base, y: 5 });
    expect(r.dy).toBeGreaterThan(0);
  });

  it('у нижнего края двигает камеру вверх (dy < 0)', () => {
    const r = edgePan({ ...base, y: VH - 5 });
    expect(r.dy).toBeLessThan(0);
  });

  it('в центре экрана камера стоит', () => {
    expect(edgePan(base)).toEqual({ dx: 0, dy: 0 });
  });

  it('в углу двигает по обеим осям', () => {
    const r = edgePan({ ...base, x: 3, y: 3 });
    expect(r.dx).toBeGreaterThan(0);
    expect(r.dy).toBeGreaterThan(0);
  });
});

describe('edgePan: НЕ срабатывает над UI (главный баг)', () => {
  it('курсор у самого края, но над панелью HUD — камера стоит', () => {
    // именно этот случай ломал игру: наведение на кнопку в углу экрана
    expect(edgePan({ ...base, x: 2, overUI: true })).toEqual({ dx: 0, dy: 0 });
    expect(edgePan({ ...base, y: 2, overUI: true })).toEqual({ dx: 0, dy: 0 });
    expect(edgePan({ ...base, x: VW - 2, y: 2, overUI: true })).toEqual({ dx: 0, dy: 0 });
  });
});

describe('edgePan: прочие блокировки', () => {
  it('во время drag-пана средней кнопкой край не трогаем', () => {
    expect(edgePan({ ...base, x: 2, panning: true })).toEqual({ dx: 0, dy: 0 });
  });

  it('на тач-устройстве edge-scroll выключен', () => {
    expect(edgePan({ ...base, x: 2, touch: true })).toEqual({ dx: 0, dy: 0 });
  });

  it('пока мышь не двигалась (active=false) — стартовые 0,0 не считаем краем', () => {
    expect(edgePan({ ...base, x: 0, y: 0, active: false })).toEqual({ dx: 0, dy: 0 });
  });
});

describe('edgePan: масштабирование скорости', () => {
  it('скорость обратно пропорциональна зуму', () => {
    const slow = edgePan({ ...base, x: 2, zoom: 2 });
    const fast = edgePan({ ...base, x: 2, zoom: 1 });
    expect(Math.abs(fast.dx)).toBeGreaterThan(Math.abs(slow.dx));
  });

  it('скорость пропорциональна dt', () => {
    const r = edgePan({ ...base, x: 2, dt: 0.032 });
    const r2 = edgePan({ ...base, x: 2, dt: 0.016 });
    expect(Math.abs(r.dx)).toBeCloseTo(Math.abs(r2.dx) * 2, 5);
  });
});
