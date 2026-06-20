// Тесты маркеров приказа «идти»: флажок назначения + оставшийся путь у выделенных юнитов.
// Чистая логика (грид-координаты), без рендера — проверяем, ЧТО показываем и КОГДА скрываем.
import { describe, it, expect } from 'vitest';
import { moveOrderMarkers } from './moveOrders';
import type { Selectable, Unit } from '../core/types';

// минимальный юнит игрока для проверки выборки (только нужные поля)
function unit(over: Partial<Unit>): Unit {
  return {
    id: 1, kind: 'unit', type: 'militia', side: 'player', name: 'воин',
    gx: 5, gy: 5, vx: 1, hp: 10, maxhp: 10, def: {} as any,
    order: { type: 'move' }, path: [{ x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 6 }], wp: 0,
    cd: 0, anim: 0, guard: { x: 8, y: 6 }, gatherRes: null, carry: 0,
    ...over,
  } as Unit;
}

describe('moveOrderMarkers: показываем маршрут и флажок', () => {
  it('у выделенного юнита с приказом move — один маркер', () => {
    const m = moveOrderMarkers([unit({})]);
    expect(m).toHaveLength(1);
  });

  it('флажок стоит в последней точке пути (куда идёт юнит)', () => {
    const [m] = moveOrderMarkers([unit({})]);
    expect(m.dest).toEqual({ x: 8, y: 6 });
  });

  it('маршрут начинается с текущей позиции юнита, затем оставшиеся точки', () => {
    const [m] = moveOrderMarkers([unit({ gx: 5.4, gy: 5.1 })]);
    expect(m.route[0]).toEqual({ x: 5.4, y: 5.1 });
    expect(m.route.slice(1)).toEqual([{ x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 6 }]);
  });

  it('пройденные точки (до wp) в маршрут не попадают', () => {
    const [m] = moveOrderMarkers([unit({ wp: 2 })]);
    expect(m.route.slice(1)).toEqual([{ x: 8, y: 6 }]);   // только хвост от wp
    expect(m.dest).toEqual({ x: 8, y: 6 });
  });
});

describe('moveOrderMarkers: когда ничего не показываем', () => {
  it('юнит не выделен — пустой список', () => {
    expect(moveOrderMarkers([])).toEqual([]);
  });

  it('юнит уже дошёл (wp за концом пути) — маркера нет', () => {
    expect(moveOrderMarkers([unit({ wp: 3 })])).toEqual([]);
  });

  it('нет пути (path = null) — маркера нет', () => {
    expect(moveOrderMarkers([unit({ path: null })])).toEqual([]);
  });

  it('приказ не move (gather/build/attack) — маркера нет', () => {
    expect(moveOrderMarkers([unit({ order: { type: 'gather' } })])).toEqual([]);
    expect(moveOrderMarkers([unit({ order: { type: 'attack' } })])).toEqual([]);
    expect(moveOrderMarkers([unit({ order: null })])).toEqual([]);
  });

  it('вражеский юнит не показывается, даже если попал в выборку', () => {
    expect(moveOrderMarkers([unit({ side: 'enemy' })])).toEqual([]);
  });

  it('здание (точка сбора рисуется отдельно) — здесь игнорируется', () => {
    const b = { kind: 'building', side: 'player' } as unknown as Selectable;
    expect(moveOrderMarkers([b])).toEqual([]);
  });

  it('несколько выделенных — маркер на каждого движущегося', () => {
    const sel: Selectable[] = [
      unit({ id: 1 }), unit({ id: 2, gx: 1, gy: 1, guard: { x: 3, y: 3 } }),
    ];
    expect(moveOrderMarkers(sel)).toHaveLength(2);
  });
});
