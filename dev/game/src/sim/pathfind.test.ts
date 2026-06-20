// Тесты A*: флаг cornerCut пускает юнитов игрока в диагональные щели между зданиями,
// а без него (враги) диагональ между двумя занятыми углами по-прежнему закрыта.
import { describe, it, expect, beforeEach } from 'vitest';
import { G } from '../core/state';
import { makeGrid } from '../core/grid';
import { findPath } from './pathfind';

beforeEach(() => {
  makeGrid();                                  // чистая сетка проходимости MAP×MAP (всё свободно)
});

const solid = (x: number, y: number) => { G.solid[y][x] = 1; };

describe('findPath: cornerCut пускает между зданиями', () => {
  it('по умолчанию диагональ между двумя углами закрыта — путь в обход', () => {
    solid(5, 5); solid(6, 6);                  // здания по диагонали, щель (5,6)↔(6,5)
    const p = findPath(5, 6, 6, 5, false);     // без cornerCut
    expect(p).not.toBeNull();
    expect(p!.length).toBeGreaterThan(1);      // вынужден обходить, а не нырять в щель
  });

  it('с cornerCut юнит ныряет в щель одним диагональным шагом', () => {
    solid(5, 5); solid(6, 6);
    const p = findPath(5, 6, 6, 5, false, true);
    expect(p).toEqual([{ x: 6, y: 5 }]);       // ровно один диагональный шаг к цели
  });

  it('обходной путь и прямой ведут в одну и ту же клетку', () => {
    solid(5, 5); solid(6, 6);
    const around = findPath(5, 6, 6, 5, false)!;
    const through = findPath(5, 6, 6, 5, false, true)!;
    expect(around[around.length - 1]).toEqual({ x: 6, y: 5 });
    expect(through[through.length - 1]).toEqual({ x: 6, y: 5 });
  });
});

describe('findPath: без cornerCut здания запирают юнита', () => {
  // окружаем старт (5,5) зданиями по всем четырём сторонам — наружу только по диагонали
  const boxIn = () => { solid(6, 5); solid(4, 5); solid(5, 6); solid(5, 4); };

  it('враг (cornerCut выкл) заперт — пути наружу нет', () => {
    boxIn();
    expect(findPath(5, 5, 8, 8, false)).toBeNull();
  });

  it('юнит игрока (cornerCut вкл) выбирается по диагонали', () => {
    boxIn();
    const p = findPath(5, 5, 8, 8, false, true);
    expect(p).not.toBeNull();
    expect(p!.length).toBeGreaterThan(0);
    expect(p![p!.length - 1]).toEqual({ x: 8, y: 8 });
  });
});
