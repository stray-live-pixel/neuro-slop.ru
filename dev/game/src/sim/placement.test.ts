// Тесты раскладки частокола линией: какие тайлы попадут под застройку при тяге.
// Чистая геометрия по сетке — без рендера и состояния.
import { describe, it, expect } from 'vitest';
import { wallLineCells } from './placement';

describe('wallLineCells: тайлы линии частокола', () => {
  it('точка (начало == конец) — одна клетка', () => {
    expect(wallLineCells(4, 4, 4, 4)).toEqual([{ x: 4, y: 4 }]);
  });

  it('горизонталь — все клетки по X на одной Y', () => {
    expect(wallLineCells(3, 5, 6, 5)).toEqual([
      { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },
    ]);
  });

  it('вертикаль — все клетки по Y на одной X', () => {
    expect(wallLineCells(2, 1, 2, 3)).toEqual([
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
    ]);
  });

  it('диагональ 45° — связная диагональ без пропусков', () => {
    expect(wallLineCells(0, 0, 3, 3)).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
    ]);
  });

  it('число клеток = длина по большей оси + 1, конец включён', () => {
    const cells = wallLineCells(0, 0, 5, 2);
    expect(cells.length).toBe(6);                          // max(5,2)+1
    expect(cells[0]).toEqual({ x: 0, y: 0 });
    expect(cells[cells.length - 1]).toEqual({ x: 5, y: 2 });
  });

  it('обратное направление даёт тот же набор клеток (в обратном порядке)', () => {
    const fwd = wallLineCells(1, 1, 4, 1);
    const rev = wallLineCells(4, 1, 1, 1).slice().reverse();
    expect(rev).toEqual(fwd);
  });
});
