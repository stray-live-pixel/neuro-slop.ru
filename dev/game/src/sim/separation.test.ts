// Тесты расталкивания: «коллайдер» юнита = 30% его клетки. Соседи ближе порога
// разъезжаются, дальше порога — стоят на месте (не распихиваются издалека).
import { describe, it, expect, beforeEach } from 'vitest';
import { G } from '../core/state';
import { makeGrid } from '../core/grid';
import { separateUnits, isMoving, COLLIDER } from './separation';
import type { Unit } from '../core/types';

// минимальный юнит для расталкивания (читаются id/gx/gy/path/wp)
let nid = 1;
const u = (gx: number, gy: number): Unit => ({ id: nid++, gx, gy } as Unit);            // стоячий (нет пути)
const mover = (gx: number, gy: number): Unit =>                                          // идёт по маршруту
  ({ id: nid++, gx, gy, path: [{ x: gx + 5, y: gy + 5 }], wp: 0 } as Unit);
const dist = (a: Unit, b: Unit) => Math.hypot(a.gx - b.gx, a.gy - b.gy);

beforeEach(() => { makeGrid(); nid = 1; });

describe('separateUnits: коллайдер 30% размера юнита', () => {
  it('коллайдер равен 0.30 тайла', () => {
    expect(COLLIDER).toBe(0.30);
  });

  it('юниты ближе коллайдера — разъезжаются', () => {
    const a = u(10, 10), b = u(10.2, 10);      // 0.2 < 0.30
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(dist(a, b)).toBeGreaterThan(0.2);
  });

  it('юниты дальше коллайдера — стоят на месте', () => {
    const a = u(10, 10), b = u(10.5, 10);      // 0.5 > 0.30
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(a).toMatchObject({ gx: 10, gy: 10 });
    expect(b).toMatchObject({ gx: 10.5, gy: 10 });
  });

  it('порог именно ~0.30: толкает на 0.28, не толкает на 0.32', () => {
    const a = u(10, 10), b = u(10.28, 10);
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(dist(a, b)).toBeGreaterThan(0.28);   // 0.28 < 0.30 → толкнуло

    const c = u(20, 20), d = u(20.32, 20);
    G.units = [c, d];
    separateUnits(1 / 30);
    expect(dist(c, d)).toBeCloseTo(0.32, 5);     // 0.32 > 0.30 → не тронуло
  });

  it('точно совпавшие СТОЯЧИЕ юниты всё равно расходятся', () => {
    const a = u(15, 15), b = u(15, 15);
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(dist(a, b)).toBeGreaterThan(0);
  });
});

describe('isMoving: идёт ли юнит по маршруту', () => {
  it('путь есть и не пройден — в движении', () => {
    expect(isMoving({ path: [{ x: 1, y: 1 }], wp: 0 } as Unit)).toBe(true);
  });
  it('путь пройден до конца (дошёл) — стоит', () => {
    expect(isMoving({ path: [{ x: 1, y: 1 }], wp: 1 } as Unit)).toBe(false);
  });
  it('пути нет (работает/простаивает) — стоит', () => {
    expect(isMoving({ path: null, wp: 0 } as Unit)).toBe(false);
  });
});

describe('separateUnits: идущие юниты залезают друг на друга', () => {
  it('два идущих в одной точке не расталкиваются (проходят насквозь)', () => {
    const a = mover(10, 10), b = mover(10, 10);
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(dist(a, b)).toBe(0);                  // остались друг на друге
  });

  it('идущий юнит не сдвигает работающего рядом', () => {
    const worker = u(10, 10), passer = mover(10.1, 10);   // проходит впритык
    G.units = [worker, passer];
    separateUnits(1 / 30);
    expect(worker).toMatchObject({ gx: 10, gy: 10 });     // работника не растолкало
  });

  it('дошедшие до цели (wp за концом пути) снова держат коллайдер', () => {
    const a = { id: nid++, gx: 12, gy: 12, path: [{ x: 12, y: 12 }], wp: 1 } as Unit;
    const b = { id: nid++, gx: 12, gy: 12, path: [{ x: 12, y: 12 }], wp: 1 } as Unit;
    G.units = [a, b];
    separateUnits(1 / 30);
    expect(dist(a, b)).toBeGreaterThan(0);       // приказ «идти» выполнен → строятся
  });
});
