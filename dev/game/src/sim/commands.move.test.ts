// Регресс на баг смещения: клик по клетке отправлял юнита/ставил флажок на клетку ВЫШЕ.
// Причина — дробные мировые координаты клика снимались на тайл через |0 (обрезание вниз),
// тогда как ghost-превью и pickTile берут БЛИЖАЙШИЙ тайл (Math.round). При клике в верхнюю
// половину ромба s2g даёт значение чуть меньше целого (напр. 4.6) — round даёт кликнутую
// клетку (5), а |0 — соседнюю вверх-влево (4). Проверяем весь путь: экранный клик → s2g →
// moveOrder → тайл приказа/флажка совпадает с кликнутой клеткой.
import { describe, it, expect, beforeEach } from 'vitest';
import { G } from '../core/state';
import { makeGrid } from '../core/grid';
import { g2s, s2g } from '../core/iso';
import { TILE } from '../data/config';
import { findPath } from './pathfind';
import { moveOrder } from './commands';
import type { Unit } from '../core/types';

function unit(over: Partial<Unit> = {}): Unit {
  return {
    id: 1, kind: 'unit', type: 'militia', side: 'player', name: 'воин',
    gx: 10, gy: 10, vx: 1, hp: 10, maxhp: 10, def: {} as any,
    order: null, queue: [], path: null, wp: 0,
    cd: 0, anim: 0, guard: { x: 10, y: 10 }, gatherRes: null, carry: 0,
    ...over,
  } as Unit;
}

const last = (u: Unit) => u.path![u.path!.length - 1];

beforeEach(() => {
  makeGrid();                                  // пустая проходимая сетка MAP×MAP
  G.cam.x = 0; G.cam.y = 0; G.cam.zoom = 1;
});

describe('findPath: дробная цель снимается на ближайший тайл (не вниз)', () => {
  it('цель 4.6,4.6 ведёт в клетку (5,5), а не (4,4)', () => {
    const p = findPath(1, 1, 4.6, 4.6, false, true)!;
    expect(p[p.length - 1]).toEqual({ x: 5, y: 5 });
  });

  it('цель 4.4,4.4 ведёт в клетку (4,4)', () => {
    const p = findPath(1, 1, 4.4, 4.4, false, true)!;
    expect(p[p.length - 1]).toEqual({ x: 4, y: 4 });
  });

  it('дробный старт тоже снимается на ближайший тайл', () => {
    // юнит в (5.6,5.6) ближе к центру (6,6) — путь начинается оттуда, а не из (5,5)
    const p = findPath(5.6, 5.6, 5.6, 5.6, false, true)!;
    expect(p[p.length - 1]).toEqual({ x: 6, y: 6 });
  });
});

describe('moveOrder: приказ снимается на кликнутую клетку (Math.round)', () => {
  it('клик в верхнюю половину ромба — флажок в той же клетке, не на клетку выше', () => {
    const u = unit();
    moveOrder(u, 4.6, 4.6);                     // дробная цель из верхней половины ромба
    expect(u.order).toMatchObject({ type: 'move', gx: 5, gy: 5 });
    expect(u.guard).toEqual({ x: 5, y: 5 });
    expect(last(u)).toEqual({ x: 5, y: 5 });    // конец пути = точка флажка
  });

  it('клик в нижнюю половину ромба остаётся в той же клетке', () => {
    const u = unit();
    moveOrder(u, 5.3, 5.3);
    expect(u.order).toMatchObject({ gx: 5, gy: 5 });
    expect(last(u)).toEqual({ x: 5, y: 5 });
  });

  it('очередь по Shift тоже округляет цель', () => {
    const u = unit({ order: { type: 'move', gx: 10, gy: 10 } });
    moveOrder(u, 7.6, 12.6, true);             // добавляем в хвост
    expect(u.queue[u.queue.length - 1]).toEqual({ type: 'move', gx: 8, gy: 13 });
  });
});

describe('сквозной сценарий: экранный клик → команда движения', () => {
  // Клик в верхнюю половину ромба клетки T: флажок обязан встать в T, а не на клетку выше.
  for (const T of [{ x: 20, y: 20 }, { x: 14, y: 27 }, { x: 31, y: 9 }]) {
    it(`клик у верха клетки (${T.x},${T.y}) → приказ ровно в (${T.x},${T.y})`, () => {
      const c = g2s(T.x, T.y);                          // центр ромба на экране
      const click = { x: c.x, y: c.y - TILE.h * 0.35 }; // точка в верхней половине ромба
      const w = s2g(click.x, click.y);                  // обратно в дробные грид-координаты

      // контроль значимости теста: тут старое |0 действительно ушло бы на клетку выше
      expect(Math.floor(w.x)).not.toBe(T.x);
      expect(Math.round(w.x)).toBe(T.x);

      const u = unit({ gx: 2, gy: 2, guard: { x: 2, y: 2 } });
      moveOrder(u, w.x, w.y);
      expect(u.order).toMatchObject({ gx: T.x, gy: T.y });
      expect(last(u)).toEqual({ x: T.x, y: T.y });
    });
  }

  it('работает и при изменённом зуме камеры', () => {
    G.cam.zoom = 1.8; G.cam.x = 123; G.cam.y = -45;
    const T = { x: 18, y: 22 };
    const c = g2s(T.x, T.y);
    const w = s2g(c.x, c.y - TILE.h * 0.35 * G.cam.zoom);
    expect(Math.round(w.x)).toBe(T.x);
    const u = unit({ gx: 5, gy: 5, guard: { x: 5, y: 5 } });
    moveOrder(u, w.x, w.y);
    expect(last(u)).toEqual({ x: T.x, y: T.y });
  });
});
